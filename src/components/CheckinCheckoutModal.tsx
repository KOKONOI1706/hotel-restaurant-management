'use client';

import { useState, useEffect } from 'react';

interface CheckinCheckoutModalProps {
  booking: any;
  type: 'checkin' | 'checkout';
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckinCheckoutModal({ booking, type, onClose, onSuccess }: CheckinCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [extraCharges, setExtraCharges] = useState(0);
  const [notes, setNotes] = useState('');
  const [usePreCalculated, setUsePreCalculated] = useState(false);
  const [realTimeAmount, setRealTimeAmount] = useState<any>(null);
  const [loadingRealTime, setLoadingRealTime] = useState(false);

  // Tính tiền thời gian thực khi mở modal checkout
  useEffect(() => {
    if (type === 'checkout') {
      calculateRealTimeAmount();
    }
  }, [type, booking._id]);

  const calculateRealTimeAmount = async () => {
    try {
      setLoadingRealTime(true);
      const response = await fetch(`/api/bookings/${booking._id}/calculate-real-amount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setRealTimeAmount(data.data);
      } else {
        console.error('Error calculating real-time amount:', data.message);
      }
    } catch (error) {
      console.error('Error calculating real-time amount:', error);
    } finally {
      setLoadingRealTime(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = type === 'checkin' 
        ? `/api/bookings/${booking._id}/checkin`
        : `/api/bookings/${booking._id}/checkout`;
      
      const body = type === 'checkout' 
        ? { extraCharges, notes, usePreCalculated }
        : {};

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  const getBaseAmount = () => {
    if (type !== 'checkout') return booking.totalAmount;
    if (usePreCalculated) return booking.totalAmount;
    return realTimeAmount?.realAmount || booking.totalAmount;
  };

  const finalAmount = type === 'checkout' 
    ? getBaseAmount() + extraCharges 
    : booking.totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {type === 'checkin' ? 'Xác nhận Check-in' : 'Xác nhận Check-out'}
          </h2>
          
          {/* Thông tin booking */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Thông tin booking</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-mono">{booking._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phòng:</span>
                <span>{booking.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Khách:</span>
                <span>{booking.representativeName}</span>
              </div>
              <div className="flex justify-between">
                <span>Loại:</span>
                <span>{booking.bookingType === 'individual' ? 'Cá nhân' : 'Công ty'}</span>
              </div>
              {booking.bookingType === 'company' && (
                <div className="flex justify-between">
                  <span>Số khách:</span>
                  <span>{booking.guests?.length || 0} người</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {type === 'checkout' && (
              <>
                {/* Tùy chọn tính tiền */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">
                    Cách tính tiền
                  </label>
                  
                  {loadingRealTime ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Đang tính toán...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Tùy chọn 1: Tính theo thời gian thực */}
                      <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          checked={!usePreCalculated}
                          onChange={() => setUsePreCalculated(false)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-blue-700">
                            Tính theo thời gian thực
                            {realTimeAmount && (
                              <span className="ml-2 text-lg font-bold">
                                {realTimeAmount.realAmount.toLocaleString('vi-VN')} VND
                              </span>
                            )}
                          </div>
                          {realTimeAmount && (
                            <div className="text-sm text-gray-600 mt-1">
                              {realTimeAmount.calculation.type === 'hourly' && (
                                <div>
                                  📅 {realTimeAmount.calculation.hoursStayed} giờ
                                  <br />🕐 {realTimeAmount.calculation.checkInTime} → {realTimeAmount.calculation.checkOutTime}
                                </div>
                              )}
                              {realTimeAmount.calculation.type === 'daily' && (
                                <div>
                                  📅 {realTimeAmount.calculation.daysStayed} ngày x {realTimeAmount.calculation.pricePerDay.toLocaleString('vi-VN')}đ
                                  <br />📆 {realTimeAmount.calculation.checkInDate} → {realTimeAmount.calculation.checkOutDate}
                                </div>
                              )}
                              {realTimeAmount.calculation.type === 'monthly' && (
                                <div>
                                  📅 {realTimeAmount.calculation.monthsStayed} tháng x {realTimeAmount.calculation.pricePerMonth.toLocaleString('vi-VN')}đ
                                  <br />📆 {realTimeAmount.calculation.checkInDate} → {realTimeAmount.calculation.checkOutDate}
                                </div>
                              )}
                              {realTimeAmount.difference !== 0 && (
                                <div className={`font-medium ${realTimeAmount.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {realTimeAmount.difference > 0 ? '+' : ''}{realTimeAmount.difference.toLocaleString('vi-VN')}đ so với tham khảo
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Tùy chọn 2: Dùng số tiền tính sẵn */}
                      <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          checked={usePreCalculated}
                          onChange={() => setUsePreCalculated(true)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-green-700">
                            Dùng số tiền tính sẵn (đã thanh toán trước)
                            <span className="ml-2 text-lg font-bold">
                              {booking.totalAmount.toLocaleString('vi-VN')} VND
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Phù hợp khi khách đã thanh toán trước hoặc có thỏa thuận riêng
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Phí phát sinh */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Phí phát sinh (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extraCharges}
                    onChange={(e) => setExtraCharges(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ví dụ: phí làm hỏng đồ đạc, sử dụng dịch vụ thêm...
                  </p>
                </div>

                {/* Ghi chú check-out */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Ghi chú check-out
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ghi chú về tình trạng phòng, thiết bị..."
                  />
                </div>

                {/* Tổng tiền */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tiền phòng:</span>
                      <span>{getBaseAmount().toLocaleString('vi-VN')} VND</span>
                    </div>
                    {extraCharges > 0 && (
                      <div className="flex justify-between">
                        <span>Phí phát sinh:</span>
                        <span>{extraCharges.toLocaleString('vi-VN')} VND</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {finalAmount.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {type === 'checkin' && (
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-green-700">
                  Xác nhận check-in cho booking này?
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Trạng thái phòng sẽ được cập nhật thành "Đang sử dụng"
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  type === 'checkin' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {loading 
                  ? (type === 'checkin' ? 'Đang check-in...' : 'Đang check-out...')
                  : (type === 'checkin' ? 'Xác nhận Check-in' : 'Xác nhận Check-out')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
