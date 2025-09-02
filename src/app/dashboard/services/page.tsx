'use client';

import { useState, useEffect, useCallback } from 'react';
import ServiceForm from '@/components/ServiceForm';
import { 
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Service {
  _id: string;
  name: string;
  description: string;
  category: 'food' | 'beverage' | 'spa' | 'laundry' | 'transport' | 'other';
  price: number;
  status: 'available' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: '',
    sortBy: 'name'
  });

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== '') params.append('isActive', filters.isActive);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data);
      } else {
        console.error('Failed to fetch services:', data.message);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services;

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchServices(); // Refresh list
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa dịch vụ');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Lỗi kết nối, vui lòng thử lại');
    }
  };

  const handleFormClose = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleFormSuccess = () => {
    fetchServices(); // Refresh list
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      food: { label: 'Ăn uống', class: 'bg-green-100 text-green-800' },
      beverage: { label: 'Đồ uống', class: 'bg-blue-100 text-blue-800' },
      spa: { label: 'Spa', class: 'bg-purple-100 text-purple-800' },
      laundry: { label: 'Giặt ủi', class: 'bg-yellow-100 text-yellow-800' },
      transport: { label: 'Vận chuyển', class: 'bg-orange-100 text-orange-800' },
      other: { label: 'Khác', class: 'bg-gray-100 text-gray-800' }
    };

    const config = categoryConfig[category as keyof typeof categoryConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || category}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {status === 'available' ? 'Hoạt động' : 'Tạm dừng'}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Dịch vụ</h1>
        <button 
          onClick={() => setShowServiceForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm dịch vụ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên dịch vụ..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="food">Ăn uống</option>
              <option value="beverage">Đồ uống</option>
              <option value="spa">Spa</option>
              <option value="laundry">Giặt ủi</option>
              <option value="transport">Vận chuyển</option>
              <option value="other">Khác</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Tạm dừng</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sắp xếp</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Tên dịch vụ</option>
              <option value="price">Giá</option>
              <option value="rating">Đánh giá</option>
              <option value="totalOrders">Số lượt đặt</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', category: '', isActive: '', sortBy: 'name' })}
              className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng dịch vụ</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Giá trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.length > 0 
                  ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length).toLocaleString('vi-VN') + 'đ'
                  : '0đ'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có dịch vụ nào
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredServices.map((service) => (
              <div key={service._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  {getStatusBadge(service.status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Danh mục:</span>
                    {getCategoryBadge(service.category)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Giá:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Ngày tạo:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(service.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditService(service)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 flex items-center justify-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showServiceForm && (
        <ServiceForm
          service={editingService || undefined}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
