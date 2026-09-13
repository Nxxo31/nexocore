// NexoCore — BullMQ Job Consumers (Workers)
// Processes queued email, invoice, and export jobs.

import { Worker, Job } from 'bullmq';
import { EmailService } from '@/modules/email/services/email.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
};

// Email job consumer
export const emailWorker = new Worker('email', async (job: Job) => {
  switch (job.name) {
    case 'welcome-email':
      await EmailService.sendWelcomeEmail(
        job.data.to,
        job.data.userName,
        job.data.tenantName
      );
      break;

    case 'password-reset-email':
      await EmailService.sendPasswordResetEmail(
        job.data.to,
        job.data.resetToken,
        job.data.tenantName
      );
      break;

    case 'invoice-email':
      await EmailService.sendInvoiceEmail(
        job.data.to,
        job.data.invoiceNumber,
        job.data.amount,
        job.data.dueDate,
        job.data.tenantName
      );
      break;

    case 'deal-alert-email':
      await EmailService.sendDealAlertEmail(job.data.to, {
        dealTitle: job.data.dealTitle,
        contactName: job.data.contactName,
        stage: job.data.stage,
        value: job.data.value,
        daysStale: job.data.daysStale,
        tenantName: job.data.tenantName,
        dealUrl: job.data.dealUrl,
      });
      break;

    case 'position-alert-email':
      await EmailService.sendPositionAlertEmail(job.data.to, {
        productName: job.data.productName,
        currentStock: job.data.currentStock,
        minStock: job.data.minStock,
        unit: job.data.unit,
        tenantName: job.data.tenantName,
        productUrl: job.data.productUrl,
      });
      break;

    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}, { connection: redisConnection });

// Invoice generation job consumer
export const invoiceWorker = new Worker('invoice-generation', async (job: Job) => {
  if (job.name === 'generate-invoices') {
    const { tenantId, period } = job.data as { tenantId: string; period: string };
    console.log(`[invoice] Processing invoice generation for tenant ${tenantId} for period ${period}`);

    // Validate period format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw new Error(`Invalid period format: ${period}. Expected YYYY-MM`);
    }

    const [year, month] = period.split('-');
    const periodStart = new Date(`${year}-${month}-01T00:00:00Z`);
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);

    // Generate invoice number from period + count of existing invoices this month
    const existingCount = await prisma.invoice.count({
      where: { tenantId, issueDate: { gte: periodStart, lt: periodEnd } },
    });
    const invoiceNumber = `${year}${month}-${String(existingCount + 1).padStart(4, '0')}`;

    // Find active subscriptions for tenant to generate invoices for
    const subscriptions = await prisma.subscription.findMany({
      where: { workspaceId: tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { workspace: { select: { name: true } } },
    });

    const created = [];
    for (const sub of subscriptions) {
      // Create invoice in DRAFT — user/owner adds line items and sends manually
      const invoice = await prisma.invoice.create({
        data: {
          tenantId,
          number: invoiceNumber,
          status: 'DRAFT',
          type: 'INVOICE',
          issueDate: periodStart,
          dueDate: new Date(`${year}-${month}-15T00:00:00Z`),
          subtotal: 0,
          taxAmount: 0,
          discount: 0,
          total: 0,
          notes: `Auto-generated for subscription ${sub.id}, period ${period}.`,
        },
      });

      // Audit the generation
      await AuditService.log({
        tenantId,
        action: 'CREATE',
        entity: 'Invoice',
        entityId: invoice.id,
        metadata: { period, invoiceNumber, subscriptionId: sub.id, source: 'queue' },
      });

      created.push(invoice.id);
    }

    console.log(`[invoice] Generated ${created.length} draft invoice(s) for tenant ${tenantId} period ${period}`);
    return { invoiceIds: created, count: created.length, period };
  }
}, { connection: redisConnection });

// Data export job consumer
export const dataExportWorker = new Worker('data-export', async (job: Job) => {
  if (job.name === 'export-data') {
    const { tenantId, module, format } = job.data as { tenantId: string; module: string; format: 'csv' | 'excel' };
    console.log(`[data-export] Processing export for tenant ${tenantId}, module ${module}, format ${format}`);

    let rowCount = 0;

    if (module === 'contacts') {
      const contacts = await prisma.contact.findMany({ where: { tenantId } });
      rowCount = contacts.length;
      // CSV serialization inline; in production would stream to S3/local file
      const headers = ['id', 'name', 'email', 'phone', 'company', 'isActive', 'createdAt'];
      const csv = [
        headers.join(','),
        ...contacts.map((c) =>
          [
            c.id,
            `"${(c.name ?? '').replace(/"/g, '""')}"`,
            `"${(c.email ?? '').replace(/"/g, '""')}"`,
            `"${(c.phone ?? '').replace(/"/g, '""')}"`,
            `"${(c.company ?? '').replace(/"/g, '""')}"`,
            c.isActive ? 'true' : 'false',
            c.createdAt.toISOString(),
          ].join(',')
        ),
      ].join('\n');
      // For now: log size + count. In production: write to file storage and email link.
      console.log(`[data-export] contacts CSV ready (${csv.length} bytes, ${rowCount} rows)`);
    } else if (module === 'deals') {
      const deals = await prisma.deal.findMany({ where: { tenantId } });
      rowCount = deals.length;
      console.log(`[data-export] deals query returned ${rowCount} rows (XLSX would be generated here)`);
    } else if (module === 'products') {
      const products = await prisma.product.findMany({ where: { tenantId } });
      rowCount = products.length;
      console.log(`[data-export] products query returned ${rowCount} rows`);
    } else {
      throw new Error(`Unsupported export module: ${module}`);
    }

    // Audit the export
    await AuditService.logExport(tenantId, undefined, module, { rowCount, format });

    console.log(`[data-export] Exported ${rowCount} rows from ${module} for tenant ${tenantId}`);
    return { module, format, rowCount };
  }
}, { connection: redisConnection });

// Handle worker events
emailWorker.on('completed', (job: Job | undefined) => {
  if (job) console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.log(`Email job ${job.id} failed with error: ${err.message}`);
  } else {
    console.log(`Email job failed with error: ${err.message}`);
  }
});

invoiceWorker.on('completed', (job: Job | undefined) => {
  if (job) console.log(`Invoice job ${job.id} completed successfully`);
});

invoiceWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.log(`Invoice job ${job.id} failed with error: ${err.message}`);
  } else {
    console.log(`Invoice job failed: ${err.message}`);
  }
});

dataExportWorker.on('completed', (job: Job | undefined) => {
  if (job) console.log(`Data export job ${job.id} completed successfully`);
});

dataExportWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.log(`Data export job ${job.id} failed with error: ${err.message}`);
  } else {
    console.log(`Data export job failed: ${err.message}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing workers...');
  await emailWorker.close();
  await invoiceWorker.close();
  await dataExportWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});
