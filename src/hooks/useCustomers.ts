import { useState, useEffect, useMemo } from 'react';
import { Customer, CustomerFormData, CustomerFilters, CustomerStats, PaginationOptions } from '@/types/customer';

// Mock data for development
const generateMockCustomers = (): Customer[] => {
  return [
    {
      _id: '1',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      phone: '0912345678',
      customerType: 'individual',
      cccd: '123456789012',
      address: '123 Trần Hưng Đạo, Quận 1, TP.HCM',
      totalBookings: 15,
      totalSpent: 35000000,
      lastBooking: '2024-01-20',
      status: 'active',
      notes: 'Khách hàng VIP, thường xuyên đặt phòng',
      createdAt: '2023-12-01',
      updatedAt: '2024-01-20'
    },
    {
      _id: '2',
      name: 'Trần Thị Bình',
      email: 'tranthib@company.com',
      phone: '0987654321',
      customerType: 'company',
      companyName: 'Công ty TNHH ABC Technology',
      taxCode: '0123456789',
      address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
      totalBookings: 28,
      totalSpent: 85000000,
      lastBooking: '2024-01-25',
      status: 'active',
      notes: 'Đối tác doanh nghiệp lớn',
      createdAt: '2023-10-15',
      updatedAt: '2024-01-25'
    },
    {
      _id: '3',
      name: 'Lê Văn Cường',
      email: 'levcuong@email.com',
      phone: '0901234567',
      customerType: 'individual',
      cccd: '987654321098',
      address: '789 Lê Lợi, Quận 3, TP.HCM',
      totalBookings: 5,
      totalSpent: 12000000,
      lastBooking: '2024-01-15',
      status: 'active',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-15'
    },
    {
      _id: '4',
      name: 'Phạm Thị Dung',
      email: 'phamdung@business.com',
      phone: '0976543210',
      customerType: 'company',
      companyName: 'Công ty Cổ phần XYZ Solutions',
      taxCode: '9876543210',
      address: '321 Đồng Khởi, Quận 1, TP.HCM',
      totalBookings: 18,
      totalSpent: 52000000,
      lastBooking: '2024-01-22',
      status: 'active',
      notes: 'Khách hàng doanh nghiệp uy tín',
      createdAt: '2023-11-20',
      updatedAt: '2024-01-22'
    },
    {
      _id: '5',
      name: 'Hoàng Văn Em',
      email: 'hoangem@email.com',
      phone: '0965432109',
      customerType: 'individual',
      cccd: '456789123456',
      totalBookings: 0,
      totalSpent: 0,
      status: 'inactive',
      notes: 'Chưa có giao dịch',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22'
    },
    {
      _id: '6',
      name: 'Đặng Thị Hoa',
      email: 'dangthihoa@gmail.com',
      phone: '0954321098',
      customerType: 'individual',
      cccd: '789123456789',
      address: '654 Pasteur, Quận 3, TP.HCM',
      totalBookings: 8,
      totalSpent: 18500000,
      lastBooking: '2024-01-18',
      status: 'active',
      createdAt: '2023-12-10',
      updatedAt: '2024-01-18'
    },
    {
      _id: '7',
      name: 'Vũ Minh Khang',
      email: 'vmkhang@enterprise.com',
      phone: '0943210987',
      customerType: 'company',
      companyName: 'Tập đoàn DEF Group',
      taxCode: '5432109876',
      address: '987 Hai Bà Trưng, Quận 3, TP.HCM',
      totalBookings: 35,
      totalSpent: 125000000,
      lastBooking: '2024-01-24',
      status: 'active',
      notes: 'Tập đoàn lớn, khách hàng chiến lược',
      createdAt: '2023-09-05',
      updatedAt: '2024-01-24'
    }
  ];
};

export interface UseCustomersReturn {
  customers: Customer[];
  stats: CustomerStats;
  filters: CustomerFilters;
  pagination: PaginationOptions;
  loading: boolean;
  error: string | null;
  updateFilters: (newFilters: Partial<CustomerFilters>) => void;
  updatePagination: (newPagination: Partial<PaginationOptions>) => void;
  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, data: CustomerFormData) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
}

export function useCustomers(): UseCustomersReturn {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    customerType: undefined,
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10
  });

  // Initialize with mock data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAllCustomers(generateMockCustomers());
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu khách hàng');
        console.error('Error loading customers:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...allCustomers];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search) ||
        (customer.companyName && customer.companyName.toLowerCase().includes(searchLower)) ||
        (customer.address && customer.address.toLowerCase().includes(searchLower))
      );
    }

    // Apply customer type filter
    if (filters.customerType) {
      result = result.filter(customer => customer.customerType === filters.customerType);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(customer => customer.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'totalBookings':
          aValue = a.totalBookings;
          bValue = b.totalBookings;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastBooking':
          aValue = a.lastBooking ? new Date(a.lastBooking).getTime() : 0;
          bValue = b.lastBooking ? new Date(b.lastBooking).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return result;
  }, [allCustomers, filters]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredAndSortedCustomers.slice(startIndex, endIndex);
  }, [filteredAndSortedCustomers, pagination]);

  // Calculate statistics
  const stats = useMemo((): CustomerStats => {
    const totalCustomers = allCustomers.length;
    const individualCustomers = allCustomers.filter(c => c.customerType === 'individual').length;
    const companyCustomers = allCustomers.filter(c => c.customerType === 'company').length;
    const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

    return {
      totalCustomers,
      individualCustomers,
      companyCustomers,
      activeCustomers,
      totalRevenue
    };
  }, [allCustomers]);

  // Update pagination info
  const paginationWithInfo = useMemo((): PaginationOptions => ({
    ...pagination,
    total: filteredAndSortedCustomers.length,
    totalPages: Math.ceil(filteredAndSortedCustomers.length / pagination.limit)
  }), [pagination, filteredAndSortedCustomers]);

  // Action handlers
  const updateFilters = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updatePagination = (newPagination: Partial<PaginationOptions>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const createCustomer = async (data: CustomerFormData): Promise<Customer> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCustomer: Customer = {
        _id: Date.now().toString(),
        ...data,
        totalBookings: 0,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAllCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      throw new Error('Không thể tạo khách hàng mới');
    }
  };

  const updateCustomer = async (id: string, data: CustomerFormData): Promise<Customer> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCustomer: Customer = {
        ...allCustomers.find(c => c._id === id)!,
        ...data,
        updatedAt: new Date().toISOString()
      };

      setAllCustomers(prev => prev.map(c => c._id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      throw new Error('Không thể cập nhật thông tin khách hàng');
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAllCustomers(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      throw new Error('Không thể xóa khách hàng');
    }
  };

  return {
    customers: paginatedCustomers,
    stats,
    filters,
    pagination: paginationWithInfo,
    loading,
    error,
    updateFilters,
    updatePagination,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}
