import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getRevenueChartData } from '@/lib/services/dashboard.service';
import { RevenueChartQuerySchema } from '@/lib/schemas';
import { requireAuth, withErrorHandling } from '@/lib/auth-middleware';

export const GET = withErrorHandling(
  requireAuth(['admin', 'manager'])(async (request: NextRequest) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams);
    
    const parsed = RevenueChartQuerySchema.safeParse(queryObject);
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

    const { from, to, granularity } = parsed.data;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const data = await getRevenueChartData(fromDate, toDate, granularity);

    return NextResponse.json(
      { success: true, data },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      }
    );
  })
);
