import { Resend } from 'resend';
import { WelcomeEmail } from '@/modules/email/templates/welcome-email';
import { PasswordResetEmail } from '@/modules/email/templates/password-reset-email';
import { InvoiceEmail } from '@/modules/email/templates/invoice-email';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  /**
   * Send a welcome email to a new user
   */
  static async sendWelcomeEmail(to: string, userName: string, tenantName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: `NexoCore <no-reply@${process.env.DOMAIN}>`,
        to,
        subject: `Bienvenido a ${tenantName}`,
        react: WelcomeEmail({ userName, tenantName }),
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send a password reset email
   */
  static async sendPasswordResetEmail(to: string, resetToken: string, tenantName: string): Promise<void> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      await resend.emails.send({
        from: `NexoCore <no-reply@${process.env.DOMAIN}>`,
        to,
        subject: `Restablece tu contraseña en ${tenantName}`,
        react: PasswordResetEmail({ resetUrl, tenantName }),
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send an invoice email
   */
  static async sendInvoiceEmail(to: string, invoiceNumber: string, amount: number, dueDate: string, tenantName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: `NexoCore <no-reply@${process.env.DOMAIN}>`,
        to,
        subject: `Factura ${invoiceNumber} - ${tenantName}`,
        react: InvoiceEmail({ invoiceNumber, amount, dueDate, tenantName }),
      });
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new Error('Failed to send invoice email');
    }
  }

  /**
   * Send a custom email (for job queue usage)
   */
  static async sendEmail(options: {
    to: string;
    subject: string;
    react: React.ReactElement;
  }): Promise<void> {
    try {
      await resend.emails.send({
        from: `NexoCore <no-reply@${process.env.DOMAIN}>`,
        ...options,
      });
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw new Error('Failed to send email');
    }
  }
}