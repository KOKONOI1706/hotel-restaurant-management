import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { processPayment } from '@/lib/services/invoice.service';
import { PaymentSchema } from '@/lib/schemas';
import { requireAuth, withErrorHandling } from '@/lib/auth-middleware';

interface RouteParams {
  params: { id: string };
}

// POST /api/invoices/[id]/payment - Process payment
export const POST = withErrorHandling(
  requireAuth(['admin', 'manager', 'staff'])(async (request: NextRequest, user: any, { params }: RouteParams) => {
    await connectDB();

    const body = await request.json();
    const parsed = PaymentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment data',
          details: parsed.error.issues 
        },
        { status: 400 }
      );
    }

    const invoice = await processPayment(params.id, parsed.data);

    return NextResponse.json(
      { success: true, data: invoice, message: 'Payment processed successfully' },
      { status: 200 }
    );
  })
);
