// NexoCore — BullMQ Job Consumers (Workers)
// Processes queued email, invoice, and export jobs.

import { Worker, Job } from 'bullmq';
import { EmailService } from '@/modules/email/services/email.service';
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
    console.log(`Processing invoice generation for tenant ${job.data.tenantId} for period ${job.data.period}`);

    // TODO: Implement actual invoice generation logic
    // 1. Query subscriptions/invoices that need to be generated for the tenant
    // 2. Create invoice records in the database
    // 3. Send invoice emails via the email queue
  }
}, { connection: redisConnection });

// Data export job consumer
export const dataExportWorker = new Worker('data-export', async (job: Job) => {
  if (job.name === 'export-data') {
    console.log(`Processing data export for tenant ${job.data.tenantId}, module ${job.data.module}, format ${job.data.format}`);

    // TODO: Implement async data export logic for large datasets
    // 1. Query the requested data from the database for the tenant
    // 2. Format it as CSV or Excel
    // 3. Store the file somewhere accessible (S3 / local)
    // 4. Send a notification email with the download link
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
