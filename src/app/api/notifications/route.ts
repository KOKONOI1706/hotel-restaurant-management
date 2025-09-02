import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Lấy tất cả booking đã gửi thông báo lưu trú
    const bookings = await Booking.find({ 
      accommodationNotificationSent: true 
    }).select({
      _id: 1,
      roomNumber: 1,
      representativeName: 1,
      representativePhone: 1,
      accommodationNotificationSent: 1,
      accommodationNotificationDate: 1,
      accommodationNotificationId: 1,
      guestRegistrations: 1
    }).sort({ accommodationNotificationDate: -1 });

    // Chuyển đổi sang format phù hợp cho frontend
    const notifications = bookings.map(booking => ({
      _id: booking._id,
      bookingId: booking._id,
      notificationId: booking.accommodationNotificationId || `TLT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${booking._id.toString().slice(-3)}`,
      guests: booking.guestRegistrations || [],
      sentDate: booking.accommodationNotificationDate || new Date().toISOString(),
      portalUrl: 'https://dichvucong.dancuquocgia.gov.vn/portal/p/home/thong-bao-luu-tru.html',
      booking: {
        _id: booking._id,
        roomNumber: booking.roomNumber,
        representativeName: booking.representativeName,
        representativePhone: booking.representativePhone
      }
    }));

    return NextResponse.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching accommodation notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách thông báo lưu trú' },
      { status: 500 }
    );
  }
}
