import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getDashboardSummary, getRecentBookings, getOccupiedRoomsWithBookings } from '@/lib/services/dashboard.service';
import { DashboardQuerySchema } from '@/lib/schemas';
import { requireAuth, withErrorHandling } from '@/lib/auth-middleware';

// GET /api/dashboard - Legacy endpoint for backward compatibility
export const GET = withErrorHandling(
  requireAuth(['admin', 'manager', 'staff'])(async (request: NextRequest) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams);
    
    const parsed = DashboardQuerySchema.safeParse(queryObject);
    const { from, to } = parsed.success ? parsed.data : {};
    
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    // Get summary data
    const summary = await getDashboardSummary({ 
      from: fromDate, 
      to: toDate 
    });

    // Get recent data for legacy compatibility
    const [recentBookings, occupiedRooms] = await Promise.all([
      getRecentBookings(5),
      getOccupiedRoomsWithBookings(10)
    ]);

    // Format room status data for chart
    const roomStatusData = [
      { name: 'Trống', value: summary.roomStats.availableRooms, color: '#10B981' },
      { name: 'Có khách', value: summary.roomStats.occupiedRooms, color: '#EF4444' },
      { name: 'Bảo trì', value: summary.roomStats.maintenanceRooms, color: '#F59E0B' },
      { name: 'Đã đặt', value: summary.roomStats.reservedRooms, color: '#3B82F6' },
      { name: 'Dọn dẹp', value: summary.roomStats.cleaningRooms, color: '#8B5CF6' }
    ].filter(item => item.value > 0);

    // Transform data for legacy compatibility
    const legacyStats = {
      totalRooms: summary.roomStats.totalRooms,
      availableRooms: summary.roomStats.availableRooms,
      occupiedRooms: summary.roomStats.occupiedRooms,
      maintenanceRooms: summary.roomStats.maintenanceRooms,
      reservedRooms: summary.roomStats.reservedRooms,
      cleaningRooms: summary.roomStats.cleaningRooms,
      totalBookings: summary.bookingStats.totalBookings,
      todayCheckIns: summary.bookingStats.todayCheckIns,
      todayCheckOuts: summary.bookingStats.todayCheckOuts,
      monthlyRevenue: summary.bookingStats.monthlyRevenue,
      yearlyRevenue: summary.bookingStats.yearlyRevenue,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: legacyStats,
        recentBookings: recentBookings.map(booking => ({
          _id: booking._id,
          guestName: booking.bookingType === 'individual' 
            ? booking.representativeName 
            : booking.companyName,
          roomInfo: booking.roomId ? {
            roomNumber: booking.roomId.roomNumber,
            type: booking.roomId.type
          } : null,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status,
          totalAmount: booking.totalAmount,
          createdAt: booking.createdAt
        })),
        occupiedRooms,
        roomStatusData
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });
  })
);
