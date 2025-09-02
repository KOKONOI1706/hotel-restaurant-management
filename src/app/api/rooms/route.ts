import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/lib/models';
// import { withAuth } from '@/lib/middleware'; // Temporarily disabled for testing

// GET /api/rooms - Get all rooms with optional filtering
export const GET = async (request: NextRequest) => { // Temporarily removed withAuth for testing
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Tăng limit mặc định từ 10 lên 50
    const showAll = searchParams.get('all') === 'true'; // Tùy chọn hiển thị tất cả

    await connectDB();
    
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Get rooms with pagination and current booking info
    let roomsQuery = Room.find(filter).sort({ roomNumber: 1 });
    
    // Nếu không yêu cầu tất cả thì áp dụng pagination
    if (!showAll) {
      roomsQuery = roomsQuery.skip(skip).limit(limit);
    }
    
    const rooms = await roomsQuery;

    // For occupied rooms, get current booking info
    const roomsWithBookings = await Promise.all(
      rooms.map(async (room) => {
        const roomObj = room.toObject();
        if (room.status === 'occupied' || room.status === 'reserved') {
          // Find current booking for this room
          const currentBooking = await require('@/lib/models').Booking
            .findOne({ 
              roomId: room._id, 
              status: { $in: ['confirmed', 'checked-in'] }
            })
            .sort({ createdAt: -1 })
            .select('bookingType representativeName companyName representativePhone representativeEmail guests checkInDate checkOutDate status actualCheckIn');
          
          if (currentBooking) {
            roomObj.currentBooking = currentBooking;
          }
        }
        return roomObj;
      })
    );

    const totalRooms = await Room.countDocuments(filter);
    const totalPages = showAll ? 1 : Math.ceil(totalRooms / limit);

    return NextResponse.json({
      success: true,
      rooms: roomsWithBookings,
      pagination: {
        page: showAll ? 1 : page,
        limit: showAll ? totalRooms : limit,
        totalPages,
        totalRooms,
        showAll,
      },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};

// POST /api/rooms - Create new room
export const POST = async (request: NextRequest) => { // Temporarily removed withAuth for testing
  try {
    const { roomNumber, type, price, description, amenities } = await request.json();

    if (!roomNumber || !type || !price) {
      return NextResponse.json(
        { success: false, error: 'Room number, type, and price are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Room number already exists' },
        { status: 409 }
      );
    }

    const room = new Room({
      roomNumber,
      type,
      price,
      description,
      amenities: amenities || [],
    });

    await room.save();

    return NextResponse.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};
