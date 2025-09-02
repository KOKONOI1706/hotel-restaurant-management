'use client';

import React, { useState, useEffect } from 'react';
import AccommodationNotificationModal from './AccommodationNotificationModal';

interface Booking {
  _id: string;
  representativeName: string;
  representativePhone: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  accommodationNotificationSent: boolean;
  accommodationNotificationStatus: string;
  accommodationNotificationDate: string;
  guestRegistrations: any[];
  roomId: { roomNumber: string };
  customerName: string;
}

export default function AccommodationNotificationList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'checked-in' | 'notified' | 'pending'>('checked-in');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      const result = await response.json();
      
      if (result.success) {
        setBookings(result.bookings || []); // Changed from result.data to result.bookings
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (filter) {
      case 'checked-in':
        return booking.status === 'checked-in';
      case 'notified':
        return booking.accommodationNotificationSent;
      case 'pending':
        return booking.status === 'checked-in' && !booking.accommodationNotificationSent;
      default:
        return true;
    }
  });

  const getStatusBadge = (booking: Booking) => {
    if (booking.accommodationNotificationSent) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Đã thông báo
        </span>
      );
    } else if (booking.status === 'checked-in') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ Cần thông báo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ⚪ Chưa check-in
        </span>
      );
    }
  };

  const openNotificationModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleSuccess = () => {
    loadBookings(); // Reload để cập nhật trạng thái
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Thông báo Lưu trú</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Tất cả booking</option>
            <option value="checked-in">Đã check-in</option>
            <option value="pending">Cần thông báo</option>
            <option value="notified">Đã thông báo</option>
          </select>
          <button
            onClick={loadBookings}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            🔄 Tải lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map(booking => (
          <div key={booking._id} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">Phòng {booking.roomId?.roomNumber || 'N/A'}</h3>
                <p className="text-gray-600">{booking.representativeName || booking.customerName}</p>
                <p className="text-sm text-gray-500">{booking.representativePhone}</p>
              </div>
              {getStatusBadge(booking)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span>{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="capitalize">{booking.status}</span>
              </div>
              {booking.accommodationNotificationSent && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thông báo lúc:</span>
                    <span>{new Date(booking.accommodationNotificationDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số khách:</span>
                    <span>{booking.guestRegistrations?.length || 0} người</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              {booking.status === 'checked-in' && (
                <button
                  onClick={() => openNotificationModal(booking)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
                    booking.accommodationNotificationSent
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {booking.accommodationNotificationSent ? '📝 Xem/Sửa' : '📋 Thông báo lưu trú'}
                </button>
              )}
              {booking.accommodationNotificationSent && (
                <button
                  className="py-2 px-3 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                  title="Xem chi tiết thông báo"
                >
                  👁️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Không có booking nào {filter !== 'all' && `thuộc danh mục "${filter}"`}</p>
        </div>
      )}

      {selectedBooking && (
        <AccommodationNotificationModal
          booking={selectedBooking}
          isOpen={showModal}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
