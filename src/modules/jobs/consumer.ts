import { Worker, Job } from 'bullmq';
import { EmailService } from '@/modules/email/services/email.service';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

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
      
    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
  },
});

// Invoice generation job consumer
export const invoiceWorker = new Worker('invoice-generation', async (job: Job) => {
  if (job.name === 'generate-invoices') {
    // Here you would implement the actual invoice generation logic
    // For now, we'll just log that the job was processed
    console.log(`Processing invoice generation for tenant ${job.data.tenantId} for period ${job.data.period}`);
    
    // TODO: Implement actual invoice generation logic
    // This would typically:
    // 1. Query subscriptions/invoices that need to be generated for the tenant
    // 2. Create invoice records in the database
    // 3. Send invoice emails via the email queue
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
  },
});

// Data export job consumer
export const dataExportWorker = new Worker('data-export', async (job: Job) => {
  if (job.name === 'export-data') {
    // Here you would implement the actual data export logic
    console.log(`Processing data export for tenant ${job.data.tenantId}, module ${job.data.module}, format ${job.data.format}`);
    
    // TODO: Implement actual data export logic
    // This would typically:
    // 1. Query the requested data from the database for the tenant
    // 2. Format it as CSV or Excel
    // 3. Store the file somewhere accessible (like S3 or local storage)
    // 4. Send a notification email with the download link
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
  },
});

// Handle worker events
emailWorker.on('completed', (job: Job | null) => {
  if (job) {
    console.log(`Job ${job.id} completed successfully`);
  }
});

emailWorker.on('failed', (job: Job | null, err: Error) => {
  if (job) {
    console.log(`Job ${job.id} failed with error: ${err.message}`);
  } else {
    console.log(`Job failed with error: ${err.message}`);
  }
});

invoiceWorker.on('completed', (job: Job | null) => {
  if (job) {
    console.log(`Invoice job ${job.id} completed successfully`);
  }
});

invoiceWorker.on('failed', (job: Job | null, err: Error) => {
  if (job) {
    console.log(`Invoice job ${job.id} failed with error: ${err.message}`);
  } else {
    console.log(`Invoice job failed with error: ${err.message}`);
  }
});

dataExportWorker.on('completed', (job: Job | null) => {
  if (job) {
    console.log(`Data export job ${job.id} completed successfully`);
  }
});

dataExportWorker.on('failed', (job: Job | null, err: Error) => {
  if (job) {
    console.log(`Data export job ${job.id} failed with error: ${err.message}`);
  } else {
    console.log(`Data export job failed with error: ${err.message}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing workers...');
  await emailWorker.close();
  await invoiceWorker.close();
  await dataExportWorker.close();
  process.exit(0);
});