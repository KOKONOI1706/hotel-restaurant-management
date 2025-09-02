import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getInvoicesWithFilter, createInvoice } from '@/lib/services/invoice.service';
import { InvoiceFilterSchema, CreateInvoiceSchema } from '@/lib/schemas';
import { requireAuth, withErrorHandling } from '@/lib/auth-middleware';

// GET /api/invoices - Get filtered invoices with pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const queryObject = Object.fromEntries(searchParams);
  
  const parsed = InvoiceFilterSchema.safeParse(queryObject);
  if (!parsed.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid query parameters',
        details: parsed.error.issues 
      },
      { status: 400 }
    );
  }

  const filter = { ...parsed.data };
  
  // Convert date strings to Date objects
  if (filter.dateFrom) {
    filter.dateFrom = new Date(filter.dateFrom) as any;
  }
  if (filter.dateTo) {
    filter.dateTo = new Date(filter.dateTo) as any;
  }

  const result = await getInvoicesWithFilter(filter as any);

  return NextResponse.json(
    { success: true, data: result },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    }
  );
});

// POST /api/invoices - Create new invoice
export const POST = withErrorHandling(async (request: NextRequest) => {
  await connectDB();

  const body = await request.json();
  const parsed = CreateInvoiceSchema.safeParse(body);
  
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

  const invoice = await createInvoice(data as any);

  return NextResponse.json(
    { success: true, data: invoice },
    { status: 201 }
  );
});
