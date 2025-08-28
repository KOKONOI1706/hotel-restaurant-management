import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Service } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy dịch vụ' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: service
    });
    
  } catch (error) {
    console.error('Service fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy thông tin dịch vụ' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      status
    } = body;
    
    // Validation
    if (!name || !description || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }
    
    if (price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Giá dịch vụ phải lớn hơn 0' },
        { status: 400 }
      );
    }
    
    // Check if service exists
    const existingService = await Service.findById(params.id);
    if (!existingService) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy dịch vụ' },
        { status: 404 }
      );
    }
    
    // Check if new name conflicts with another service
    if (name !== existingService.name) {
      const nameConflict = await Service.findOne({ 
        name,
        _id: { $ne: params.id }
      });
      if (nameConflict) {
        return NextResponse.json(
          { success: false, message: 'Tên dịch vụ đã tồn tại' },
          { status: 400 }
        );
      }
    }
    
    const updatedService = await Service.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        category,
        price,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật dịch vụ thành công',
      data: updatedService
    });
    
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật dịch vụ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy dịch vụ' },
        { status: 404 }
      );
    }
    
    await Service.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Xóa dịch vụ thành công'
    });
    
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa dịch vụ' },
      { status: 500 }
    );
  }
}
