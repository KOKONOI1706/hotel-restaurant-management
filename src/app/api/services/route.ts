import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Service } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    
    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== null && isActive !== '') {
      filter.status = isActive === 'true' ? 'available' : 'unavailable';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'price':
        sort = { price: 1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'createdAt':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { name: 1 };
    }
    
    const services = await Service.find(filter).sort(sort);
    
    return NextResponse.json({
      success: true,
      data: services
    });
    
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách dịch vụ' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      status = 'available'
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
    
    // Check if service name already exists
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return NextResponse.json(
        { success: false, message: 'Tên dịch vụ đã tồn tại' },
        { status: 400 }
      );
    }
    
    const newService = new Service({
      name,
      description,
      category,
      price,
      status
    });
    
    await newService.save();
    
    return NextResponse.json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      data: newService
    });
    
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo dịch vụ' },
      { status: 500 }
    );
  }
}
