import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getDashboardSummary } from '@/lib/services/dashboard.service';
import { DashboardQuerySchema } from '@/lib/schemas';
import { requireAuth, withErrorHandling } from '@/lib/auth-middleware';

export const GET = withErrorHandling(async (request: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const queryObject = Object.fromEntries(searchParams);
  
  const parsed = DashboardQuerySchema.safeParse(queryObject);
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

  const { from, to } = parsed.data;
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  const summary = await getDashboardSummary({ 
    from: fromDate, 
    to: toDate 
  });

  return NextResponse.json(
    { success: true, data: summary },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    }
  );
});
