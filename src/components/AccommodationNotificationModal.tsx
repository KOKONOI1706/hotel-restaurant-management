'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Guest {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  passportNumber?: string;
  nationality: string;
  phoneNumber: string;
  address: string;
  checkInDate: string;
  estimatedCheckOutDate: string;
  purpose: string;
  roomNumber: string;
  isMainGuest?: boolean;
}

interface Booking {
  _id: string;
  customerName: string;
  roomId: { roomNumber: string };
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

interface Props {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AccommodationNotificationModal({ booking, isOpen, onClose, onSuccess }: Props) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<any>(null);

  const loadNotificationData = useCallback(async () => {
    if (!booking) return;
    
    try {
      const response = await fetch(`/api/bookings/${booking._id}/accommodation-notification`);
      const result = await response.json();
      
      if (result.success && result.data.guestRegistrations.length > 0) {
        setGuests(result.data.guestRegistrations);
        setNotification(result.data);
      } else {
        // Tạo guest mặc định từ booking
        setGuests([createDefaultGuest()]);
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
      setGuests([createDefaultGuest()]);
    }
  }, [booking]);

  useEffect(() => {
    if (isOpen && booking) {
      loadNotificationData();
    }
  }, [isOpen, loadNotificationData]);

  const createDefaultGuest = (): Guest => ({
    fullName: booking.customerName || '',
    dateOfBirth: '',
    gender: '',
    idNumber: '',
    passportNumber: '',
    nationality: 'Vietnam',
    phoneNumber: '',
    address: '',
    checkInDate: booking.checkInDate || '',
    estimatedCheckOutDate: booking.checkOutDate || '',
    purpose: 'Du lịch',
    roomNumber: booking.roomId?.roomNumber || '',
    isMainGuest: true
  });

  const addGuest = () => {
    setGuests([...guests, {
      ...createDefaultGuest(),
      isMainGuest: false
    }]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const saveNotification = async () => {
    setLoading(true);
    try {
      // Validate dữ liệu cơ bản
      for (let i = 0; i < guests.length; i++) {
        const guest = guests[i];
        if (!guest.fullName || !guest.dateOfBirth || !guest.idNumber) {
          alert(`Vui lòng điền đầy đủ thông tin bắt buộc cho khách ${i + 1}`);
          return;
        }
      }

      const response = await fetch(`/api/bookings/${booking._id}/accommodation-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guests,
          status: 'completed'
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Đã lưu thông tin thông báo lưu trú thành công!');
        onSuccess();
        onClose();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Thông Báo Lưu Trú</h2>
          <p className="text-gray-600">
            Booking: {booking.customerName} - Phòng: {booking.roomId?.roomNumber}
          </p>
          {notification?.accommodationNotificationSent && (
            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
              ✅ Đã thông báo lưu trú lúc: {new Date(notification.accommodationNotificationDate).toLocaleString('vi-VN')}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Thông tin khách lưu trú</h3>
            <button
              type="button"
              onClick={addGuest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + Thêm khách
            </button>
          </div>

          <div className="space-y-6">
            {guests.map((guest, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">
                    Khách {index + 1} {guest.isMainGuest && '(Khách chính)'}
                  </h4>
                  {guests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guest.fullName}
                      onChange={(e) => updateGuest(index, 'fullName', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={guest.dateOfBirth}
                      onChange={(e) => updateGuest(index, 'dateOfBirth', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Giới tính</label>
                    <select
                      value={guest.gender}
                      onChange={(e) => updateGuest(index, 'gender', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số CCCD/CMND <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guest.idNumber}
                      onChange={(e) => updateGuest(index, 'idNumber', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Nhập số CCCD/CMND"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Số hộ chiếu</label>
                    <input
                      type="text"
                      value={guest.passportNumber || ''}
                      onChange={(e) => updateGuest(index, 'passportNumber', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Nhập số hộ chiếu (nếu có)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Quốc tịch</label>
                    <input
                      type="text"
                      value={guest.nationality}
                      onChange={(e) => updateGuest(index, 'nationality', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Nhập quốc tịch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={guest.phoneNumber}
                      onChange={(e) => updateGuest(index, 'phoneNumber', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Lý do lưu trú</label>
                    <select
                      value={guest.purpose}
                      onChange={(e) => updateGuest(index, 'purpose', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Du lịch">Du lịch</option>
                      <option value="Công tác">Công tác</option>
                      <option value="Học tập">Học tập</option>
                      <option value="Khám chữa bệnh">Khám chữa bệnh</option>
                      <option value="Thăm gia đình">Thăm gia đình</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Số phòng</label>
                    <input
                      type="text"
                      value={guest.roomNumber}
                      onChange={(e) => updateGuest(index, 'roomNumber', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Nhập số phòng"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                    <textarea
                      value={guest.address}
                      onChange={(e) => updateGuest(index, 'address', e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={2}
                      placeholder="Nhập địa chỉ thường trú"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={saveNotification}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>
    </div>
  );
}
