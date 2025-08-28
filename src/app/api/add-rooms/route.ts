import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/lib/models';

export async function POST() {
  try {
    await connectDB();
    
    // Thêm các phòng mới theo yêu cầu
    const newRooms = [
      // Phòng đơn (Single rooms)
      {
        roomNumber: '201',
        type: 'single',
        price: 100000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn tiêu chuẩn tầng 2'
      },
      {
        roomNumber: '206',
        type: 'single',
        price: 100000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn tiêu chuẩn tầng 2'
      },
      {
        roomNumber: '207',
        type: 'single',
        price: 100000,
        status: 'available',
        amenities: ['WiFi', 'TV', 'Air Conditioning'],
        description: 'Phòng đơn tiêu chuẩn tầng 2'
      },
      // Phòng đôi (Double rooms)
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
      }
    ];

    // Kiểm tra và chỉ thêm phòng chưa tồn tại
    const addedRooms = [];
    const skippedRooms = [];

    for (const roomData of newRooms) {
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
      message: `Đã thêm ${addedRooms.length} phòng mới thành công!`,
      data: {
        addedRooms: addedRooms.length,
        addedRoomNumbers: addedRooms.map(room => room.roomNumber),
        skippedRooms: skippedRooms.length,
        skippedRoomNumbers: skippedRooms,
        details: {
          singleRooms: ['201', '206', '207'],
          doubleRooms: ['202', '203', '204', '205']
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
