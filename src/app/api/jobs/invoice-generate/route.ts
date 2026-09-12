import { NextResponse } from 'next/server';
import { InvoiceJobProducer } from '@/modules/jobs/producer';
import { getTenantSession } from '@/shared/auth/session';

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    const { period } = await request.json();

    if (!period) {
      return NextResponse.json(
        { error: 'period is required' },
        { status: 400 }
      );
    }

    await InvoiceJobProducer.addInvoiceGenerationJob(session.tenantId, period);

    return NextResponse.json(
      { message: 'Invoice generation job queued successfully' },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error queuing invoice generation job:', error);
    return NextResponse.json(
      { error: 'Failed to queue invoice generation job' },
      { status: 500 }
    );
  }
}