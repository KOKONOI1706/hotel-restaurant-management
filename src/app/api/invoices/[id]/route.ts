import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getInvoiceById, updateInvoice, deleteInvoice } from '@/lib/services/invoice.service';
import { UpdateInvoiceSchema } from '@/lib/schemas';
import { requireAuth, withErrorHandling } from '@/lib/auth-middleware';

interface RouteParams {
  params: { id: string };
}

// GET /api/invoices/[id] - Get invoice by ID
export const GET = withErrorHandling(
  requireAuth(['admin', 'manager', 'staff'])(async (request: NextRequest, user: any, { params }: RouteParams) => {
    await connectDB();

    const invoice = await getInvoiceById(params.id);

    return NextResponse.json(
      { success: true, data: invoice },
      { status: 200 }
    );
  })
);

// PUT /api/invoices/[id] - Update invoice
export const PUT = withErrorHandling(
  requireAuth(['admin', 'manager'])(async (request: NextRequest, user: any, { params }: RouteParams) => {
    await connectDB();

    const body = await request.json();
    const parsed = UpdateInvoiceSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: parsed.error.issues 
        },
        { status: 400 }
      );
    }

    const data = { ...parsed.data };
    
    // Convert date string to Date object
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate) as any;
    }

    const invoice = await updateInvoice(params.id, data as any);

    return NextResponse.json(
      { success: true, data: invoice },
      { status: 200 }
    );
  })
);

// DELETE /api/invoices/[id] - Delete invoice
export const DELETE = withErrorHandling(
  requireAuth(['admin', 'manager'])(async (request: NextRequest, user: any, { params }: RouteParams) => {
    await connectDB();

    await deleteInvoice(params.id);

    return NextResponse.json(
      { success: true, message: 'Invoice deleted successfully' },
      { status: 200 }
    );
  })
);
