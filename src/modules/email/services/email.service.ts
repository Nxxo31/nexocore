// NexoCore — Email Service (Resend)
// Transactional email via Resend. React Email templates rendered server-side.

import { Resend } from 'resend';
import { WelcomeEmail } from '@/modules/email/templates/welcome-email';
import { PasswordResetEmail } from '@/modules/email/templates/password-reset-email';
import { InvoiceEmail } from '@/modules/email/templates/invoice-email';
import { DealAlertEmail } from '@/modules/email/templates/deal-alert-email';
import { PositionAlertEmail } from '@/modules/email/templates/position-alert-email';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = `NexoCore <no-reply@${process.env.DOMAIN ?? 'nexocore.app'}>`;

export class EmailService {
  /**
   * Send a welcome email to a new user (onboarding flow trigger).
   */
  static async sendWelcomeEmail(to: string, userName: string, tenantName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to,
        subject: `Bienvenido a ${tenantName} en NexoCore`,
        react: WelcomeEmail({ userName, tenantName }),
      });
    } catch (error) {
      console.error('[EmailService] Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send a password reset email.
   */
  static async sendPasswordResetEmail(to: string, resetToken: string, tenantName: string): Promise<void> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      await resend.emails.send({
        from: DEFAULT_FROM,
        to,
        subject: `Restablece tu contraseña en ${tenantName}`,
        react: PasswordResetEmail({ resetUrl, tenantName }),
      });
    } catch (error) {
      console.error('[EmailService] Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send an invoice email.
   */
  static async sendInvoiceEmail(to: string, invoiceNumber: string, amount: number, dueDate: string, tenantName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to,
        subject: `Factura ${invoiceNumber} - ${tenantName}`,
        react: InvoiceEmail({ invoiceNumber, amount, dueDate, tenantName }),
      });
    } catch (error) {
      console.error('[EmailService] Error sending invoice email:', error);
      throw new Error('Failed to send invoice email');
    }
  }

  /**
   * Send a deal-stale alert email (deal stuck in a pipeline stage too long).
   */
  static async sendDealAlertEmail(
    to: string,
    params: {
      dealTitle: string;
      contactName: string;
      stage: string;
      value: number;
      daysStale: number;
      tenantName: string;
      dealUrl?: string;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to,
        subject: `⚠️ Negociación estancada: ${params.dealTitle}`,
        react: DealAlertEmail({
          dealTitle: params.dealTitle,
          contactName: params.contactName,
          stage: params.stage,
          value: params.value,
          daysStale: params.daysStale,
          tenantName: params.tenantName,
          dealUrl: params.dealUrl,
        }),
      });
    } catch (error) {
      console.error('[EmailService] Error sending deal alert email:', error);
      throw new Error('Failed to send deal alert email');
    }
  }

  /**
   * Send a low-stock (position) alert email.
   */
  static async sendPositionAlertEmail(
    to: string,
    params: {
      productName: string;
      currentStock: number;
      minStock: number;
      unit: string;
      tenantName: string;
      productUrl?: string;
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to,
        subject: `🔴 Stock bajo: ${params.productName}`,
        react: PositionAlertEmail({
          productName: params.productName,
          currentStock: params.currentStock,
          minStock: params.minStock,
          unit: params.unit,
          tenantName: params.tenantName,
          productUrl: params.productUrl,
        }),
      });
    } catch (error) {
      console.error('[EmailService] Error sending position alert email:', error);
      throw new Error('Failed to send position alert email');
    }
  }

  /**
   * Send a custom email (for advanced / direct usage).
   */
  static async sendEmail(options: {
    to: string;
    subject: string;
    react: React.ReactElement;
  }): Promise<void> {
    try {
      await resend.emails.send({
        from: DEFAULT_FROM,
        ...options,
      });
    } catch (error) {
      console.error('[EmailService] Error sending custom email:', error);
      throw new Error('Failed to send email');
    }
  }
}
