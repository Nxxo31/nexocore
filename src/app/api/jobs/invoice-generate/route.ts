import { NextResponse } from 'next/server';
import { InvoiceJobProducer } from '@/modules/jobs/producer';

export async function POST(request: Request) {
  try {
    const { tenantId, period } = await request.json();

    if (!tenantId || !period) {
      return NextResponse.json(
        { error: 'tenantId and period are required' },
        { status: 400 }
      );
    }

    await InvoiceJobProducer.addInvoiceGenerationJob(tenantId, period);

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