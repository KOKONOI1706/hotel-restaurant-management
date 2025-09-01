'use client';

import { useState, useEffect } from 'react';
import BookingForm from '@/components/BookingForm';
import CheckinCheckoutModal from '@/components/CheckinCheckoutModal';

  interface Booking {
  _id: string;
  bookingType: 'individual' | 'company';
  rentalType: 'hourly' | 'daily' | 'monthly';
  roomId: string;
  roomNumber: string;
  representativeName: string;
  representativePhone: string;
  companyName?: string;
  guests: any[];
  checkInDate: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalAmount: number; // Giá tính sẵn (tham khảo/thanh toán trước)
  finalAmount?: number; // Tổng tiền cuối cùng sau check-out (bao gồm phí phát sinh)
  baseAmount?: number; // Số tiền cơ sở dùng để tính finalAmount (thời gian thực hoặc tính sẵn)
  extraCharges?: number; // Phí phát sinh
  checkoutNotes?: string; // Ghi chú check-out
  usePreCalculated?: boolean; // Có sử dụng số tiền tính sẵn khi checkout không
  useCustomAmount?: boolean; // Có sử dụng tùy chỉnh giá khi checkout không
  customAmount?: number; // Số tiền tùy chỉnh
  realTimeCalculation?: any; // Thông tin tính toán thời gian thực
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  createdAt: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [checkinCheckoutModal, setCheckinCheckoutModal] = useState<{
    booking: Booking;
    type: 'checkin' | 'checkout';
  } | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    bookingType: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    dateType: 'checkIn' // 'checkIn', 'checkOut', 'created'
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/bookings?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      } else {
        console.error('Error fetching bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleCreateBooking = async (bookingData: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (data.success) {
        setShowBookingForm(false);
        fetchBookings(); // Refresh danh sách
        alert('Tạo booking thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra khi tạo booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Có lỗi xảy ra khi tạo booking');
    }
  };

  const getStatusBadge = (status: string, booking?: Booking) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800' },
      'checked-in': { label: 'Đã check-in', class: 'bg-green-100 text-green-800' },
      'checked-out': { label: 'Đã check-out', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    let label = config?.label || status;
    
    // Thêm thông tin thời gian thực tế
    if (booking && status === 'checked-in' && booking.actualCheckIn) {
      const actualTime = new Date(booking.actualCheckIn).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      label = `${label} (${actualTime})`;
    } else if (booking && status === 'checked-out' && booking.actualCheckOut) {
      const actualTime = new Date(booking.actualCheckOut).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      label = `${label} (${actualTime})`;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    );
  };

  const getRentalTypeBadge = (type: string) => {
    const typeConfig = {
      hourly: { label: 'Theo giờ', class: 'bg-green-100 text-green-800' },
      daily: { label: 'Theo ngày', class: 'bg-blue-100 text-blue-800' },
      monthly: { label: 'Theo tháng', class: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || type}
      </span>
    );
  };

  const getBookingTypeBadge = (type: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        type === 'individual' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {type === 'individual' ? 'Cá nhân' : 'Công ty'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hiển thị thời gian ưu tiên thực tế
  const getDisplayTime = (booking: Booking) => {
    if (booking.rentalType === 'hourly') {
      // Với thuê theo giờ, hiển thị giờ vào/ra
      const checkInTime = booking.actualCheckIn 
        ? new Date(booking.actualCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : booking.checkInTime;
      
      const checkOutTime = booking.actualCheckOut 
        ? new Date(booking.actualCheckOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : booking.checkOutTime;

      return (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className={booking.actualCheckIn ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {checkInTime}
            </span>
            {booking.actualCheckIn && <span className="text-green-500 text-xs">✓</span>}
          </div>
          <div className="flex items-center gap-1">
            <span className={booking.actualCheckOut ? 'text-gray-600 font-medium' : 'text-gray-400'}>
              {checkOutTime}
            </span>
            {booking.actualCheckOut && <span className="text-gray-500 text-xs">✓</span>}
          </div>
        </div>
      );
    } else {
      // Với thuê theo ngày/tháng, hiển thị ngày
      const checkInDisplay = booking.actualCheckIn 
        ? formatDate(booking.actualCheckIn)
        : formatDate(booking.checkInDate);
      
      const checkOutDisplay = booking.checkOutDate 
        ? (booking.actualCheckOut 
          ? formatDate(booking.actualCheckOut)
          : formatDate(booking.checkOutDate))
        : 'Chưa xác định';

      return (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className={booking.actualCheckIn ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {checkInDisplay}
            </span>
            {booking.actualCheckIn && <span className="text-green-500 text-xs">✓</span>}
          </div>
          {booking.checkOutDate && (
            <div className="flex items-center gap-1">
              <span className={booking.actualCheckOut ? 'text-gray-600 font-medium' : 'text-gray-400'}>
                {checkOutDisplay}
              </span>
              {booking.actualCheckOut && <span className="text-gray-500 text-xs">✓</span>}
            </div>
          )}
        </div>
      );
    }
  };

  // Hiển thị tổng tiền (phân biệt giữa tính sẵn, thời gian thực và tùy chỉnh)
  const getDisplayAmount = (booking: Booking) => {
    if (booking.status === 'checked-out' && booking.finalAmount) {
      return (
        <div className="text-sm">
          <div className="font-bold text-blue-600">
            {booking.finalAmount.toLocaleString('vi-VN')} VND
          </div>
          {booking.useCustomAmount ? (
            <div className="text-xs text-purple-600">
              Tùy chỉnh: {booking.customAmount?.toLocaleString('vi-VN')}đ
            </div>
          ) : booking.baseAmount && booking.baseAmount !== booking.totalAmount ? (
            <div className="text-xs text-purple-600">
              {booking.usePreCalculated ? 'Tính sẵn' : 'Thời gian thực'}: {booking.baseAmount.toLocaleString('vi-VN')}đ
            </div>
          ) : null}
          {!booking.useCustomAmount && booking.extraCharges && booking.extraCharges > 0 && (
            <div className="text-xs text-green-600">
              + {booking.extraCharges.toLocaleString('vi-VN')} phí PS
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {booking.totalAmount.toLocaleString('vi-VN')} VND
          </div>
          <div className="text-xs text-gray-500">
            (Tham khảo)
          </div>
        </div>
      );
    }
  };

  const getQuickDateFilter = (type: 'today' | 'tomorrow' | 'thisWeek' | 'thisMonth') => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    switch (type) {
      case 'today':
        return {
          dateFrom: formatDateForInput(today),
          dateTo: formatDateForInput(today)
        };
      case 'tomorrow':
        return {
          dateFrom: formatDateForInput(tomorrow),
          dateTo: formatDateForInput(tomorrow)
        };
      case 'thisWeek':
        return {
          dateFrom: formatDateForInput(startOfWeek),
          dateTo: formatDateForInput(endOfWeek)
        };
      case 'thisMonth':
        return {
          dateFrom: formatDateForInput(startOfMonth),
          dateTo: formatDateForInput(endOfMonth)
        };
      default:
        return { dateFrom: '', dateTo: '' };
    }
  };

  const applyQuickDateFilter = (type: 'today' | 'tomorrow' | 'thisWeek' | 'thisMonth') => {
    const dateRange = getQuickDateFilter(type);
    setFilters({
      ...filters,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo
    });
  };

  const canCheckIn = (booking: Booking) => {
    // Chỉ cho phép check-in khi:
    // 1. Booking đã được confirm
    // 2. Chưa check-in thực tế
    return booking.status === 'confirmed' && !booking.actualCheckIn;
  };

  const canCheckOut = (booking: Booking) => {
    // Chỉ cho phép check-out khi:
    // 1. Đã check-in thực tế
    // 2. Chưa check-out thực tế
    return booking.status === 'checked-in' && booking.actualCheckIn && !booking.actualCheckOut;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Booking</h1>
        <button
          onClick={() => setShowBookingForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Tạo Booking Mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên khách, số phòng..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="checked-in">Đã check-in</option>
              <option value="checked-out">Đã check-out</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Loại booking</label>
            <select
              value={filters.bookingType}
              onChange={(e) => setFilters({...filters, bookingType: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="individual">Cá nhân</option>
              <option value="company">Công ty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lọc theo ngày</label>
            <select
              value={filters.dateType}
              onChange={(e) => setFilters({...filters, dateType: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="checkIn">Ngày check-in</option>
              <option value="checkOut">Ngày check-out</option>
              <option value="created">Ngày tạo booking</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">Lọc nhanh:</span>
            <button
              onClick={() => applyQuickDateFilter('today')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={() => applyQuickDateFilter('tomorrow')}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Ngày mai
            </button>
            <button
              onClick={() => applyQuickDateFilter('thisWeek')}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              Tuần này
            </button>
            <button
              onClick={() => applyQuickDateFilter('thisMonth')}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
            >
              Tháng này
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {filters.dateFrom || filters.dateTo ? (
                <span className="text-blue-600 font-medium">
                  Lọc theo {filters.dateType === 'checkIn' ? 'ngày check-in' : 
                            filters.dateType === 'checkOut' ? 'ngày check-out' : 'ngày tạo booking'}
                  {filters.dateFrom && ` từ ${new Date(filters.dateFrom).toLocaleDateString('vi-VN')}`}
                  {filters.dateTo && ` đến ${new Date(filters.dateTo).toLocaleDateString('vi-VN')}`}
                </span>
              ) : (
                'Chưa áp dụng bộ lọc ngày'
              )}
            </div>
            
            <button
              onClick={() => setFilters({ status: '', bookingType: '', search: '', dateFrom: '', dateTo: '', dateType: 'checkIn' })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Statistics */}
      {!loading && bookings && bookings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
              <div className="text-sm text-gray-600">Tổng bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Đã xác nhận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {bookings.filter(b => b.status === 'checked-in').length}
              </div>
              <div className="text-sm text-gray-600">Đã check-in</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString('vi-VN')} VND
              </div>
              <div className="text-sm text-gray-600">Tổng doanh thu</div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có booking nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng & Khách
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại thuê
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(bookings || []).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          #{booking._id.slice(-6)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatDate(booking.createdAt)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>🏠 {booking.roomNumber}</span>
                          {getBookingTypeBadge(booking.bookingType)}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {booking.bookingType === 'individual' 
                            ? booking.representativeName 
                            : booking.companyName || 'Công ty'
                          }
                        </div>
                        <div className="text-gray-500 text-xs">
                          📞 {booking.representativePhone}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getRentalTypeBadge(booking.rentalType || 'daily')}
                    </td>
                    
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {getDisplayTime(booking)}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {getDisplayAmount(booking)}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status, booking)}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {canCheckIn(booking) && (
                          <button
                            onClick={() => setCheckinCheckoutModal({ booking, type: 'checkin' })}
                            className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                          >
                            Check-in
                          </button>
                        )}
                        {canCheckOut(booking) && (
                          <>
                            <button
                              onClick={() => setCheckinCheckoutModal({ booking, type: 'checkout' })}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                            >
                              Check-out
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/bookings/${booking._id}/calculate-real-amount`, {
                                    method: 'POST',
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    const { realAmount, preCalculatedAmount, difference, calculation } = data.data;
                                    const diffText = difference > 0 ? `+${difference.toLocaleString('vi-VN')}đ` : difference < 0 ? `${difference.toLocaleString('vi-VN')}đ` : 'Bằng nhau';
                                    const timeInfo = calculation.type === 'hourly' 
                                      ? `${calculation.hoursStayed} giờ`
                                      : calculation.type === 'daily'
                                      ? `${calculation.daysStayed} ngày` 
                                      : `${calculation.monthsStayed} tháng`;
                                    
                                    alert(`💰 Tiền thực tế: ${realAmount.toLocaleString('vi-VN')}đ\n📊 Tiền tham khảo: ${preCalculatedAmount.toLocaleString('vi-VN')}đ\n📈 Chênh lệch: ${diffText}\n⏱️ Thời gian: ${timeInfo}`);
                                  }
                                } catch (error) {
                                  alert('Lỗi khi tính tiền thực tế');
                                }
                              }}
                              className="text-purple-600 hover:text-purple-900 text-xs bg-purple-50 px-2 py-1 rounded"
                              title="Xem tiền tính theo thời gian thực"
                            >
                              💰
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setSelectedBookingDetail(booking)}
                          className="text-gray-600 hover:text-gray-900 text-xs bg-gray-50 px-2 py-1 rounded"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          onSubmit={handleCreateBooking}
          onCancel={() => setShowBookingForm(false)}
        />
      )}

      {/* Check-in/Check-out Modal */}
      {checkinCheckoutModal && (
        <CheckinCheckoutModal
          booking={checkinCheckoutModal.booking}
          type={checkinCheckoutModal.type}
          onClose={() => setCheckinCheckoutModal(null)}
          onSuccess={() => {
            fetchBookings(); // Refresh danh sách
            setCheckinCheckoutModal(null);
          }}
        />
      )}

      {/* Booking Detail Modal */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Chi tiết Booking #{selectedBookingDetail._id.slice(-6)}</h2>
                <button
                  onClick={() => setSelectedBookingDetail(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin cơ bản */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Thông tin booking</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã booking:</span>
                      <span className="font-medium">#{selectedBookingDetail._id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">🏠 {selectedBookingDetail.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại booking:</span>
                      {getBookingTypeBadge(selectedBookingDetail.bookingType)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại thuê:</span>
                      {getRentalTypeBadge(selectedBookingDetail.rentalType || 'daily')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      {getStatusBadge(selectedBookingDetail.status, selectedBookingDetail)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-medium">{formatDate(selectedBookingDetail.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin thời gian */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Thông tin thời gian</h3>
                  <div className="space-y-2">
                    {selectedBookingDetail.rentalType === 'hourly' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày thuê:</span>
                          <span className="font-medium">{new Date(selectedBookingDetail.checkInDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giờ vào (dự kiến):</span>
                          <span className="font-medium text-gray-500">{selectedBookingDetail.checkInTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giờ ra (dự kiến):</span>
                          <span className="font-medium text-gray-500">{selectedBookingDetail.checkOutTime}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in (dự kiến):</span>
                          <span className="font-medium text-gray-500">{formatDate(selectedBookingDetail.checkInDate)}</span>
                        </div>
                        {selectedBookingDetail.checkOutDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-out (dự kiến):</span>
                            <span className="font-medium text-gray-500">{formatDate(selectedBookingDetail.checkOutDate)}</span>
                          </div>
                        )}
                      </>
                    )}
                    {selectedBookingDetail.actualCheckIn && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in thực tế:</span>
                        <span className="font-medium text-green-600">✓ {formatDate(selectedBookingDetail.actualCheckIn)}</span>
                      </div>
                    )}
                    {selectedBookingDetail.actualCheckOut && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out thực tế:</span>
                        <span className="font-medium text-blue-600">✓ {formatDate(selectedBookingDetail.actualCheckOut)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">
                    {selectedBookingDetail.bookingType === 'individual' ? 'Thông tin khách hàng' : 'Thông tin công ty'}
                  </h3>
                  <div className="space-y-2">
                    {selectedBookingDetail.bookingType === 'individual' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên:</span>
                          <span className="font-medium">{selectedBookingDetail.representativeName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Điện thoại:</span>
                          <span className="font-medium">{selectedBookingDetail.representativePhone}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên công ty:</span>
                          <span className="font-medium">{selectedBookingDetail.companyName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Điện thoại liên hệ:</span>
                          <span className="font-medium">{selectedBookingDetail.representativePhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số khách:</span>
                          <span className="font-medium">{selectedBookingDetail.guests?.length || 0} người</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Thông tin thanh toán</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền phòng (tham khảo):</span>
                      <span className="font-medium">{selectedBookingDetail.totalAmount.toLocaleString('vi-VN')} VND</span>
                    </div>
                    
                    {/* Hiển thị thông tin tính tiền thời gian thực nếu có */}
                    {selectedBookingDetail.status === 'checked-out' && selectedBookingDetail.baseAmount && (
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <div className="flex justify-between">
                          <span className="text-blue-700 font-medium">
                            {selectedBookingDetail.useCustomAmount 
                              ? 'Giá tùy chỉnh:' 
                              : `Tiền phòng (${selectedBookingDetail.usePreCalculated ? 'tính sẵn' : 'thời gian thực'}):`
                            }
                          </span>
                          <span className="font-bold text-blue-800">
                            {selectedBookingDetail.useCustomAmount 
                              ? selectedBookingDetail.customAmount?.toLocaleString('vi-VN') 
                              : selectedBookingDetail.baseAmount.toLocaleString('vi-VN')
                            } VND
                          </span>
                        </div>
                        
                        {!selectedBookingDetail.useCustomAmount && selectedBookingDetail.realTimeCalculation && !selectedBookingDetail.usePreCalculated && (
                          <div className="mt-2 text-sm text-blue-600">
                            <div>📅 {selectedBookingDetail.realTimeCalculation.type === 'hourly' 
                              ? `${selectedBookingDetail.realTimeCalculation.hoursStayed} giờ` 
                              : selectedBookingDetail.realTimeCalculation.type === 'daily'
                              ? `${selectedBookingDetail.realTimeCalculation.daysStayed} ngày`
                              : `${selectedBookingDetail.realTimeCalculation.monthsStayed} tháng`}
                            </div>
                            {selectedBookingDetail.realTimeCalculation.checkInTime && (
                              <div>🕐 Vào: {selectedBookingDetail.realTimeCalculation.checkInTime}</div>
                            )}
                            {selectedBookingDetail.realTimeCalculation.checkOutTime && (
                              <div>🕐 Ra: {selectedBookingDetail.realTimeCalculation.checkOutTime}</div>
                            )}
                          </div>
                        )}
                        
                        {selectedBookingDetail.useCustomAmount ? (
                          <div className="mt-1 text-sm">
                            <span className="text-purple-600 font-medium">
                              Tùy chỉnh theo thỏa thuận riêng
                            </span>
                            <div className="text-gray-500 mt-1">
                              Giá tham khảo ban đầu: {selectedBookingDetail.totalAmount.toLocaleString('vi-VN')} VND
                            </div>
                          </div>
                        ) : selectedBookingDetail.baseAmount !== selectedBookingDetail.totalAmount && (
                          <div className="mt-1 text-sm">
                            <span className={`font-medium ${selectedBookingDetail.baseAmount > selectedBookingDetail.totalAmount ? 'text-red-600' : 'text-green-600'}`}>
                              {selectedBookingDetail.baseAmount > selectedBookingDetail.totalAmount ? '+' : ''}
                              {(selectedBookingDetail.baseAmount - selectedBookingDetail.totalAmount).toLocaleString('vi-VN')} VND
                            </span>
                            <span className="text-gray-500 ml-1">so với tham khảo</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!selectedBookingDetail.useCustomAmount && selectedBookingDetail.extraCharges && selectedBookingDetail.extraCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí phát sinh:</span>
                        <span className="font-medium text-orange-600">+{selectedBookingDetail.extraCharges.toLocaleString('vi-VN')} VND</span>
                      </div>
                    )}
                    {selectedBookingDetail.finalAmount && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-800 font-semibold">Tổng cộng:</span>
                        <span className="font-bold text-blue-600 text-lg">{selectedBookingDetail.finalAmount.toLocaleString('vi-VN')} VND</span>
                      </div>
                    )}
                    {!selectedBookingDetail.finalAmount && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-800 font-semibold">Tổng cộng (dự kiến):</span>
                        <span className="font-bold text-blue-600 text-lg">{selectedBookingDetail.totalAmount.toLocaleString('vi-VN')} VND</span>
                      </div>
                    )}
                    {selectedBookingDetail.checkoutNotes && (
                      <div className="mt-3 pt-2 border-t">
                        <span className="text-gray-600 text-sm">Ghi chú check-out:</span>
                        <p className="text-gray-800 text-sm mt-1">{selectedBookingDetail.checkoutNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách khách (nếu có) */}
              {selectedBookingDetail.bookingType === 'company' && selectedBookingDetail.guests && selectedBookingDetail.guests.length > 0 && (
                <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Danh sách khách ({selectedBookingDetail.guests.length} người)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBookingDetail.guests.map((guest: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium">{guest.name}</div>
                        <div className="text-sm text-gray-600">📞 {guest.phone || 'Chưa có'}</div>
                        <div className="text-sm text-gray-600">📧 {guest.email || 'Chưa có'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-4">
                {canCheckIn(selectedBookingDetail) && (
                  <button
                    onClick={() => {
                      setCheckinCheckoutModal({ booking: selectedBookingDetail, type: 'checkin' });
                      setSelectedBookingDetail(null);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Check-in
                  </button>
                )}
                {canCheckOut(selectedBookingDetail) && (
                  <button
                    onClick={() => {
                      setCheckinCheckoutModal({ booking: selectedBookingDetail, type: 'checkout' });
                      setSelectedBookingDetail(null);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Check-out
                  </button>
                )}
                <button
                  onClick={() => setSelectedBookingDetail(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}