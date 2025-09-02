import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Invoice } from '@/lib/models';

// Lấy thông tin hóa đơn
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const invoice = await Invoice.findById(params.id)
      .populate('bookingId')
      .populate('customerId')
      .populate('serviceIds');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: invoice
    });
    
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy thông tin hóa đơn' },
      { status: 500 }
    );
  }
}

// Cập nhật hóa đơn
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    
    const invoice = await Invoice.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('bookingId').populate('customerId').populate('serviceIds');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật hóa đơn thành công',
      data: invoice
    });
    
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật hóa đơn' },
      { status: 500 }
    );
  }
}

// Xóa hóa đơn
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const invoice = await Invoice.findByIdAndDelete(params.id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Xóa hóa đơn thành công'
    });
    
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa hóa đơn' },
      { status: 500 }
    );
  }
}
