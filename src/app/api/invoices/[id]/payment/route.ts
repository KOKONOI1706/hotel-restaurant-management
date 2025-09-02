import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Invoice } from '@/lib/models';

// Cập nhật trạng thái thanh toán
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { paymentStatus, paymentMethod, paidAmount, paymentDate, notes } = await request.json();
    
    if (!['pending', 'paid', 'partial', 'refunded'].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: 'Trạng thái thanh toán không hợp lệ' },
        { status: 400 }
      );
    }
    
    const invoice = await Invoice.findById(params.id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }
    
    // Cập nhật thông tin thanh toán
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date()
    };
    
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (notes) updateData.paymentNotes = notes;
    
    // Nếu trạng thái là paid hoặc partial, cập nhật ngày thanh toán
    if (paymentStatus === 'paid' || paymentStatus === 'partial') {
      updateData.paymentDate = updateData.paymentDate || new Date();
      if (paymentStatus === 'paid') {
        updateData.paidAmount = invoice.totalAmount;
      }
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('bookingId').populate('customerId');
    
    return NextResponse.json({
      success: true,
      message: `Cập nhật trạng thái thanh toán thành ${paymentStatus}`,
      data: updatedInvoice
    });
    
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật thanh toán' },
      { status: 500 }
    );
  }
}
