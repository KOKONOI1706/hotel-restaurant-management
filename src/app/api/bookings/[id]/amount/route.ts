import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const { totalAmount } = await request.json();

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Số tiền không hợp lệ' },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { 
        totalAmount: totalAmount,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật tổng tiền thành công',
      data: booking
    });

  } catch (error) {
    console.error('Update amount error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật tổng tiền' },
      { status: 500 }
    );
  }
}
