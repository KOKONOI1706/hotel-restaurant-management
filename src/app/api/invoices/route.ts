import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Invoice, Booking, Customer } from '@/lib/models';

// Lấy danh sách hóa đơn
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const customerId = searchParams.get('customerId');
    const bookingId = searchParams.get('bookingId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    let filter: any = {};
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customerId = customerId;
    if (bookingId) filter.bookingId = bookingId;
    
    // Date filters
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }
    
    const invoices = await Invoice.find(filter)
      .populate('bookingId')
      .populate('customerId')
      .populate('serviceIds')
      .sort({ createdAt: -1 })
      .limit(100);
    
    return NextResponse.json({
      success: true,
      invoices: invoices
    });
    
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách hóa đơn' },
      { status: 500 }
    );
  }
}

// Tạo hóa đơn mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const invoiceData = await request.json();
    const { bookingId, customerId, serviceIds = [], taxes = 0, paymentMethod } = invoiceData;
    
    // Kiểm tra booking tồn tại
    const booking = await Booking.findById(bookingId).populate('roomId');
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }
    
    // Kiểm tra đã có invoice chưa
    const existingInvoice = await Invoice.findOne({ bookingId });
    if (existingInvoice) {
      return NextResponse.json(
        { success: false, message: 'Booking này đã có hóa đơn' },
        { status: 400 }
      );
    }
    
    // Tính tiền phòng
    let roomCharges = booking.finalAmount || booking.totalAmount;
    
    // Tính tiền dịch vụ (nếu có)
    let serviceCharges = 0;
    if (serviceIds.length > 0) {
      // TODO: Implement service charges calculation
      // const services = await Service.find({ _id: { $in: serviceIds } });
      // serviceCharges = services.reduce((sum, service) => sum + service.price, 0);
    }
    
    // Tổng tiền
    const totalAmount = roomCharges + serviceCharges + taxes;
    
    // Tạo hóa đơn
    const invoice = await Invoice.create({
      bookingId,
      customerId: customerId || booking.customerId,
      serviceIds,
      roomCharges,
      serviceCharges,
      taxes,
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'cash'
    });
    
    // Populate data for response
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('bookingId')
      .populate('customerId')
      .populate('serviceIds');
    
    return NextResponse.json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: populatedInvoice
    });
    
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo hóa đơn' },
      { status: 500 }
    );
  }
}
