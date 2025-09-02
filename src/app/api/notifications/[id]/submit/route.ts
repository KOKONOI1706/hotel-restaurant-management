import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/lib/models';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { submitted } = await request.json();
    const notificationId = params.id;

    // Tìm booking dựa trên accommodation notification ID
    const booking = await Booking.findOne({ 
      accommodationNotificationId: notificationId 
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông báo lưu trú' },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái đã gửi hồ sơ
    booking.submittedToPortal = submitted;
    booking.portalSubmissionDate = submitted ? new Date() : null;
    await booking.save();

    return NextResponse.json({
      success: true,
      message: submitted ? 'Đã đánh dấu hồ sơ đã gửi' : 'Đã bỏ đánh dấu đã gửi',
      data: {
        submittedToPortal: booking.submittedToPortal,
        portalSubmissionDate: booking.portalSubmissionDate
      }
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật trạng thái gửi hồ sơ' },
      { status: 500 }
    );
  }
}
