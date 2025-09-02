import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/lib/models';

interface GuestRegistration {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  passportNumber?: string;
  nationality: string;
  phoneNumber: string;
  address: string;
  checkInDate: string;
  estimatedCheckOutDate: string;
  purpose: string;
  roomNumber: string;
  isMainGuest?: boolean;
}

// Lưu thông tin thông báo lưu trú
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const booking = await Booking.findById(params.id).populate('roomId');
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { guests, status = 'completed' } = body;

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Thông tin khách không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate thông tin khách cơ bản
    for (const guest of guests) {
      if (!guest.fullName || !guest.dateOfBirth || !guest.idNumber) {
        return NextResponse.json(
          { success: false, message: 'Thiếu thông tin bắt buộc của khách (họ tên, ngày sinh, số giấy tờ)' },
          { status: 400 }
        );
      }
    }

    // Cập nhật booking với thông tin thông báo lưu trú
    const updateData = {
      accommodationNotificationSent: status === 'completed',
      accommodationNotificationDate: new Date(),
      accommodationNotificationStatus: status,
      guestRegistrations: guests,
      updatedAt: new Date()
    };

    await Booking.findByIdAndUpdate(params.id, updateData);

    return NextResponse.json({
      success: true,
      message: status === 'completed' ? 'Đã lưu thông tin thông báo lưu trú' : 'Đã lưu thông tin khách lưu trú',
      data: {
        bookingId: params.id,
        submissionDate: updateData.accommodationNotificationDate,
        guestCount: guests.length,
        status: status,
        guests: guests.map((guest: GuestRegistration) => ({
          fullName: guest.fullName,
          roomNumber: guest.roomNumber,
          nationality: guest.nationality,
          checkInDate: guest.checkInDate,
          estimatedCheckOutDate: guest.estimatedCheckOutDate
        }))
      }
    });

  } catch (error) {
    console.error('Accommodation notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi lưu thông tin lưu trú' },
      { status: 500 }
    );
  }
}

// Lấy thông tin thông báo lưu trú
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const booking = await Booking.findById(params.id).populate('roomId');
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id,
        accommodationNotificationSent: booking.accommodationNotificationSent || false,
        accommodationNotificationDate: booking.accommodationNotificationDate,
        accommodationNotificationStatus: booking.accommodationNotificationStatus || 'pending',
        guestRegistrations: booking.guestRegistrations || [],
        bookingInfo: {
          customerName: booking.customerName,
          roomNumber: booking.roomId?.roomNumber,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status
        }
      }
    });

  } catch (error) {
    console.error('Get accommodation notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// Cập nhật trạng thái thông báo lưu trú
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    await Booking.findByIdAndUpdate(params.id, {
      accommodationNotificationStatus: status,
      accommodationNotificationSent: status === 'completed',
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái thành ${status}`,
      data: { status }
    });

  } catch (error) {
    console.error('Update accommodation notification status error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}
