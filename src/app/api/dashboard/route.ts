import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, Booking } from '@/lib/models';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';

// GET /api/dashboard - Get dashboard statistics
export const GET = async (request: NextRequest) => {
  try {
    await connectDB();
    
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    const startOfThisYear = startOfYear(today);
    const endOfThisYear = endOfYear(today);

    // Get room statistics
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    const reservedRooms = await Room.countDocuments({ status: 'reserved' });
    const cleaningRooms = await Room.countDocuments({ status: 'cleaning' });

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const todayCheckIns = await Booking.countDocuments({
      checkInDate: { $gte: startOfToday, $lte: endOfToday },
      status: 'confirmed'
    });
    const todayCheckOuts = await Booking.countDocuments({
      checkOutDate: { $gte: startOfToday, $lte: endOfToday },
      status: 'checked-in'
    });

    // Calculate revenue
    const monthlyBookings = await Booking.find({
      createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
    });
    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const yearlyBookings = await Booking.find({
      createdAt: { $gte: startOfThisYear, $lte: endOfThisYear },
      status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
    });
    const yearlyRevenue = yearlyBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('roomId', 'roomNumber type')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bookingType representativeName companyName checkInDate checkOutDate status totalAmount createdAt');

    // Get occupied rooms with booking info
    const occupiedRoomsWithBookings = await Room.find({ 
      status: { $in: ['occupied', 'reserved'] } 
    }).limit(10);

    const occupiedRoomsData = await Promise.all(
      occupiedRoomsWithBookings.map(async (room) => {
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

    // Room status distribution for chart
    const roomStatusData = [
      { name: 'Trống', value: availableRooms, color: '#10B981' },
      { name: 'Có khách', value: occupiedRooms, color: '#EF4444' },
      { name: 'Bảo trì', value: maintenanceRooms, color: '#F59E0B' },
      { name: 'Đã đặt', value: reservedRooms, color: '#3B82F6' },
      { name: 'Dọn dẹp', value: cleaningRooms, color: '#8B5CF6' }
    ].filter(item => item.value > 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
          reservedRooms,
          cleaningRooms,
          totalBookings,
          todayCheckIns,
          todayCheckOuts,
          monthlyRevenue,
          yearlyRevenue,
        },
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
        occupiedRooms: occupiedRoomsData,
        roomStatusData
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};
