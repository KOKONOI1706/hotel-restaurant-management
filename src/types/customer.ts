export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  customerType: 'individual' | 'company';
  
  // Individual customer fields
  cccd?: string;
  
  // Company customer fields
  companyName?: string;
  taxCode?: string;
  
  // Common fields
  address?: string;
  notes?: string;
  
  // Statistics
  totalBookings: number;
  totalSpent: number;
  lastBooking?: string;
  
  // Status
  status: 'active' | 'inactive';
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerFilters {
  search: string;
  customerType?: 'individual' | 'company';
  status?: 'active' | 'inactive';
  sortBy: 'name' | 'email' | 'createdAt' | 'totalSpent' | 'totalBookings' | 'lastBooking';
  sortOrder: 'asc' | 'desc';
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  customerType: 'individual' | 'company';
  cccd?: string;
  companyName?: string;
  taxCode?: string;
  address?: string;
  notes?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface CustomerStats {
  totalCustomers: number;
  individualCustomers: number;
  companyCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
