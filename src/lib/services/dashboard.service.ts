import { Room, Booking, Invoice } from '@/lib/models';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';

export interface DashboardSummaryOptions {
  from?: Date;
  to?: Date;
}

export interface DashboardSummary {
  totals: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    debt: number;
  };
  statusCounts: {
    paid: number;
    pending: number;
    partial: number;
    refunded: number;
  };
  roomStats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
    cleaningRooms: number;
  };
  bookingStats: {
    totalBookings: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  };
}

export interface RevenueData {
  date: string;
  paidAmount: number;
  debt: number;
}

export async function getDashboardSummary(opts: DashboardSummaryOptions = {}): Promise<DashboardSummary> {
  const { from, to } = opts;
  
  // Date filters
  const dateFilter = from && to ? {
    createdAt: { $gte: from, $lte: to }
  } : {};

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  const startOfThisMonth = startOfMonth(today);
  const endOfThisMonth = endOfMonth(today);
  const startOfThisYear = startOfYear(today);
  const endOfThisYear = endOfYear(today);

  // Invoice aggregations
  const [invoiceStats, statusCounts] = await Promise.all([
    Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
        }
      }
    ]),
    Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Room statistics
  const [
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    reservedRooms,
    cleaningRooms
  ] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ status: 'available' }),
    Room.countDocuments({ status: 'occupied' }),
    Room.countDocuments({ status: 'maintenance' }),
    Room.countDocuments({ status: 'reserved' }),
    Room.countDocuments({ status: 'cleaning' })
  ]);

  // Booking statistics
  const [
    totalBookings,
    todayCheckIns,
    todayCheckOuts,
    monthlyBookings,
    yearlyBookings
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({
      checkInDate: { $gte: startOfToday, $lte: endOfToday },
      status: 'confirmed'
    }),
    Booking.countDocuments({
      checkOutDate: { $gte: startOfToday, $lte: endOfToday },
      status: 'checked-in'
    }),
    Booking.find({
      createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
    }).select('finalAmount totalAmount paidAmount'),
    Booking.find({
      createdAt: { $gte: startOfThisYear, $lte: endOfThisYear },
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
    }).select('finalAmount totalAmount paidAmount')
  ]);

  // Calculate revenue from paid amounts, not total amounts
  const monthlyRevenue = monthlyBookings.reduce((sum, booking) => {
    return sum + (booking.paidAmount || 0);
  }, 0);

  const yearlyRevenue = yearlyBookings.reduce((sum, booking) => {
    return sum + (booking.paidAmount || 0);
  }, 0);

  // Process results
  const invoiceData = invoiceStats[0] || { 
    totalInvoices: 0, 
    totalAmount: 0, 
    paidAmount: 0 
  };

  const statusCountsMap = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {} as Record<string, number>);

  return {
    totals: {
      totalInvoices: invoiceData.totalInvoices,
      totalAmount: invoiceData.totalAmount,
      paidAmount: invoiceData.paidAmount,
      debt: invoiceData.totalAmount - invoiceData.paidAmount,
    },
    statusCounts: {
      paid: statusCountsMap.paid || 0,
      pending: statusCountsMap.pending || 0,
      partial: statusCountsMap.partial || 0,
      refunded: statusCountsMap.refunded || 0,
    },
    roomStats: {
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      reservedRooms,
      cleaningRooms,
    },
    bookingStats: {
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      monthlyRevenue,
      yearlyRevenue,
    },
  };
}

export async function getRevenueChartData(
  from: Date,
  to: Date,
  granularity: 'day' | 'month' = 'day'
): Promise<RevenueData[]> {
  const groupFormat = granularity === 'day' ? 
    '%Y-%m-%d' : '%Y-%m';

  const data = await Invoice.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        paidAmount: { $sum: '$paidAmount' },
        totalAmount: { $sum: '$totalAmount' },
      }
    },
    {
      $project: {
        date: '$_id',
        paidAmount: 1,
        debt: { $subtract: ['$totalAmount', '$paidAmount'] },
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);

  return data;
}

export async function getRecentBookings(limit: number = 10) {
  return await Booking.find()
    .populate('roomId', 'roomNumber type')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('bookingType representativeName companyName checkInDate checkOutDate status totalAmount createdAt');
}

export async function getOccupiedRoomsWithBookings(limit: number = 10) {
  const occupiedRooms = await Room.find({ 
    status: { $in: ['occupied', 'reserved'] } 
  }).limit(limit);

  return await Promise.all(
    occupiedRooms.map(async (room) => {
      const booking = await Booking.findOne({ 
        roomId: room._id, 
        status: { $in: ['confirmed', 'checked-in'] }
      }).sort({ createdAt: -1 });
      
      return {
        _id: room._id,
        roomNumber: room.roomNumber,
        type: room.type,
        status: room.status,
        booking: booking ? {
          guestName: booking.bookingType === 'individual' 
            ? booking.representativeName 
            : booking.companyName,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status
        } : null
      };
    })
  );
}
