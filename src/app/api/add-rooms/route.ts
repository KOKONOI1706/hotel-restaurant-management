import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/lib/models';

console.log('🔧 Room model imported:', !!Room);

export async function POST(request: NextRequest) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Lấy body request để có thể tạo phòng tùy chỉnh
    const body = await request.json().catch(() => null);
    console.log('📥 Request body:', body);

    // Kiểm tra xem có muốn reset tất cả phòng không
    if (body && body.resetAll) {
      console.log('🔄 Resetting all rooms...');
      await Room.deleteMany({});
      console.log('🗑️ All existing rooms deleted');
    }
    
    // Nếu có dữ liệu tùy chỉnh trong request body
    if (body && body.customRooms) {
      const { customRooms } = body;
      const addedRooms = [];
      const skippedRooms = [];

      for (const roomData of customRooms) {
        const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
        if (!existingRoom) {
          const newRoom = await Room.create(roomData);
          addedRooms.push(newRoom);
        } else {
          skippedRooms.push(roomData.roomNumber);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Đã thêm ${addedRooms.length} phòng tùy chỉnh thành công!`,
        data: {
          addedRooms: addedRooms.length,
          addedRoomNumbers: addedRooms.map(room => room.roomNumber),
          skippedRooms: skippedRooms.length,
          skippedRoomNumbers: skippedRooms
        }
      });
    }
    
    // Tạo nhiều phòng mặc định hơn (15 phòng thay vì 7)
    const newRooms = [
      // Tầng 1 - Phòng tiêu chuẩn
      {
        roomNumber: '101',
        type: 'single',
        price: 80000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn tiêu chuẩn tầng 1'
      },
      {
        roomNumber: '102',
        type: 'double',
        price: 120000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
        description: 'Phòng đôi tiêu chuẩn tầng 1'
      },
      {
        roomNumber: '103',
        type: 'double',
        price: 120000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
        description: 'Phòng đôi tiêu chuẩn tầng 1'
      },
      {
        roomNumber: '104',
        type: 'suite',
        price: 200000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony'],
        description: 'Suite cao cấp tầng 1 với jacuzzi'
      },
      
      // Tầng 2 - Phòng deluxe
      {
        roomNumber: '201',
        type: 'single',
        price: 100000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn deluxe tầng 2'
      },
      {
        roomNumber: '202',
        type: 'double',
        price: 150000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        description: 'Phòng đôi deluxe tầng 2 với ban công'
      },
      {
        roomNumber: '203',
        type: 'double',
        price: 150000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        description: 'Phòng đôi deluxe tầng 2 với ban công'
      },
      {
        roomNumber: '204',
        type: 'double',
        price: 150000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        description: 'Phòng đôi deluxe tầng 2 với ban công'
      },
      {
        roomNumber: '205',
        type: 'double',
        price: 150000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        description: 'Phòng đôi deluxe tầng 2 với ban công'
      },
      {
        roomNumber: '206',
        type: 'single',
        price: 100000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn deluxe tầng 2'
      },
      {
        roomNumber: '207',
        type: 'single',
        price: 100000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn deluxe tầng 2'
      },
      
      // Tầng 3 - Phòng VIP
      {
        roomNumber: '301',
        type: 'suite',
        price: 250000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Room Service'],
        description: 'VIP Suite tầng 3 với view đẹp'
      },
      {
        roomNumber: '302',
        type: 'suite',
        price: 250000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Room Service'],
        description: 'VIP Suite tầng 3 với view đẹp'
      },
      {
        roomNumber: '303',
        type: 'double',
        price: 180000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        description: 'Phòng đôi VIP tầng 3'
      },
      {
        roomNumber: '304',
        type: 'double',
        price: 180000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        description: 'Phòng đôi VIP tầng 3'
      }
    ];

    // Kiểm tra và chỉ thêm phòng chưa tồn tại
    const addedRooms = [];
    const skippedRooms = [];

    console.log(`🏨 Processing ${newRooms.length} rooms...`);

    for (const roomData of newRooms) {
      console.log(`🔍 Checking room ${roomData.roomNumber}...`);
      const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
      if (!existingRoom) {
        console.log(`➕ Creating room ${roomData.roomNumber}...`);
        const newRoom = await Room.create(roomData);
        addedRooms.push(newRoom);
        console.log(`✅ Room ${roomData.roomNumber} created successfully`);
      } else {
        console.log(`⚠️ Room ${roomData.roomNumber} already exists, skipping`);
        skippedRooms.push(roomData.roomNumber);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Đã thêm ${addedRooms.length} phòng mới thành công!`,
      data: {
        addedRooms: addedRooms.length,
        addedRoomNumbers: addedRooms.map(room => room.roomNumber),
        skippedRooms: skippedRooms.length,
        skippedRoomNumbers: skippedRooms,
        details: {
          floor1: ['101', '102', '103', '104'],
          floor2: ['201', '202', '203', '204', '205', '206', '207'],
          floor3: ['301', '302', '303', '304'],
          roomTypes: {
            single: addedRooms.filter(r => r.type === 'single').length,
            double: addedRooms.filter(r => r.type === 'double').length,
            suite: addedRooms.filter(r => r.type === 'suite').length
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Add rooms error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi khi thêm phòng',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
