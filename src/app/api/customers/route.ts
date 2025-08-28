import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Customer } from '@/lib/models';
import { withAuth } from '@/lib/middleware';

// GET /api/customers - Get all customers
export const GET = withAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const totalCustomers = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit);

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          totalPages,
          totalCustomers,
        },
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/customers - Create new customer
export const POST = withAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    
    const { name, email, phone, address, identityCard } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this email or phone already exists' },
        { status: 409 }
      );
    }

    const customer = new Customer({
      name,
      email,
      phone,
      address,
      identityCard,
    });

    await customer.save();

    return NextResponse.json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
