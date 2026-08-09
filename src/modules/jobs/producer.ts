import { emailQueue, invoiceQueue, dataExportQueue } from './queue.setup';

// Email job producer
export class EmailJobProducer {
  /**
   * Add a welcome email job to the queue
   */
  static async addWelcomeEmailJob(to: string, userName: string, tenantName: string) {
    await emailQueue.add('welcome-email', {
      to,
      userName,
      tenantName,
    }, {
      // Remove duplicate jobs for the same email
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Add a password reset email job to the queue
   */
  static async addPasswordResetEmailJob(to: string, resetToken: string, tenantName: string) {
    await emailQueue.add('password-reset-email', {
      to,
      resetToken,
      tenantName,
    }, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Add an invoice email job to the queue
   */
  static async addInvoiceEmailJob(to: string, invoiceNumber: string, amount: number, dueDate: string, tenantName: string) {
    await emailQueue.add('invoice-email', {
      to,
      invoiceNumber,
      amount,
      dueDate,
      tenantName,
    }, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}

// Invoice generation job producer
export class InvoiceJobProducer {
  /**
   * Add an invoice generation job to the queue
   */
  static async addInvoiceGenerationJob(tenantId: string, period: string) {
    await invoiceQueue.add('generate-invoices', {
      tenantId,
      period,
    }, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }
}

// Data export job producer
export class DataExportJobProducer {
  /**
   * Add a data export job to the queue
   */
  static async addDataExportJob(tenantId: string, module: string, format: 'csv' | 'excel') {
    await dataExportQueue.add('export-data', {
      tenantId,
      module,
      format,
    }, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}