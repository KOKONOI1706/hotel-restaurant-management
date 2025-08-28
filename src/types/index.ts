import { ObjectId } from 'mongoose';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'staff';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Room {
  _id?: ObjectId;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  price: number;
  description?: string;
  amenities?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Customer {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  address?: string;
  identityCard?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Booking {
  _id?: ObjectId;
  customerId: ObjectId;
  roomId: ObjectId;
  checkIn: Date;
  checkOut: Date;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Service {
  _id?: ObjectId;
  name: string;
  description?: string;
  price: number;
  category: 'food' | 'beverage' | 'spa' | 'laundry' | 'transport' | 'other';
  status: 'available' | 'unavailable';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Invoice {
  _id?: ObjectId;
  bookingId: ObjectId;
  customerId: ObjectId;
  serviceIds?: ObjectId[];
  roomCharges: number;
  serviceCharges: number;
  taxes: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'transfer';
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

// Chart data types
export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface RoomStatusData {
  status: string;
  count: number;
  color: string;
}
