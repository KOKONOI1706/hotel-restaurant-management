import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/lib/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// Helper function to verify auth for dynamic routes
async function authenticateRequest(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/rooms/[id] - Get room by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const room = await Room.findById(params.id);
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/rooms/[id] - Update room
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Temporarily disable auth for testing
    // const user = await authenticateRequest(request);
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    await connectDB();
    
    const updateData = await request.json();
    
    // If updating room number, check for conflicts
    if (updateData.roomNumber) {
      const existingRoom = await Room.findOne({ 
        roomNumber: updateData.roomNumber,
        _id: { $ne: params.id }
      });
      
      if (existingRoom) {
        return NextResponse.json(
          { success: false, error: 'Room number already exists' },
          { status: 409 }
        );
      }
    }

    const room = await Room.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete room
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Temporarily disable auth for testing
    // const user = await authenticateRequest(request);
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    await connectDB();
    
    const room = await Room.findByIdAndDelete(params.id);
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
