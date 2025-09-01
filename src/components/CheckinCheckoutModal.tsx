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
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState(0);

  // Tính tiền thời gian thực khi mở modal checkout
  useEffect(() => {
    if (type === 'checkout') {
      calculateRealTimeAmount();
      // Khởi tạo custom amount bằng với total amount
      setCustomAmount(booking.totalAmount);
    }
  }, [type, booking._id, booking.totalAmount]);

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
        ? { 
            extraCharges, 
            notes, 
            usePreCalculated, 
            useCustomAmount, 
            customAmount: useCustomAmount ? customAmount : undefined 
          }
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
    if (useCustomAmount) return customAmount;
    if (usePreCalculated) return booking.totalAmount;
    return realTimeAmount?.realAmount || booking.totalAmount;
  };

  const finalAmount = type === 'checkout' 
    ? (useCustomAmount ? customAmount : getBaseAmount() + extraCharges)
    : booking.totalAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold">
            {type === 'checkin' ? 'Xác nhận Check-in' : 'Xác nhận Check-out'}
          </h2>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Thông tin booking */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h3 className="font-semibold mb-2 text-sm">Thông tin booking</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="font-mono ml-1">{booking._id.slice(-6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Phòng:</span>
                <span className="ml-1">{booking.roomNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Khách:</span>
                <span className="ml-1">{booking.representativeName}</span>
              </div>
              <div>
                <span className="text-gray-600">Loại:</span>
                <span className="ml-1">{booking.bookingType === 'individual' ? 'Cá nhân' : 'Công ty'}</span>
              </div>
              {booking.bookingType === 'company' && (
                <div className="col-span-2">
                  <span className="text-gray-600">Số khách:</span>
                  <span className="ml-1">{booking.guests?.length || 0} người</span>
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
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="animate-pulse">
                        <div className="h-3 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Đang tính toán...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Tùy chọn 1: Tính theo thời gian thực */}
                      <label className="flex items-start space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          checked={!usePreCalculated && !useCustomAmount}
                          onChange={() => {
                            setUsePreCalculated(false);
                            setUseCustomAmount(false);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-blue-700 text-sm">
                            Thời gian thực
                            {realTimeAmount && (
                              <span className="ml-2 text-base font-bold">
                                {realTimeAmount.realAmount.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                          {realTimeAmount && (
                            <div className="text-xs text-gray-600 mt-1">
                              {realTimeAmount.calculation.type === 'hourly' && (
                                <div>
                                  {realTimeAmount.calculation.hoursStayed}h | {realTimeAmount.calculation.checkInTime} → {realTimeAmount.calculation.checkOutTime}
                                </div>
                              )}
                              {realTimeAmount.calculation.type === 'daily' && (
                                <div>
                                  {realTimeAmount.calculation.daysStayed} ngày x {realTimeAmount.calculation.pricePerDay.toLocaleString('vi-VN')}đ
                                </div>
                              )}
                              {realTimeAmount.calculation.type === 'monthly' && (
                                <div>
                                  {realTimeAmount.calculation.monthsStayed} tháng x {realTimeAmount.calculation.pricePerMonth.toLocaleString('vi-VN')}đ
                                </div>
                              )}
                              {realTimeAmount.difference !== 0 && (
                                <div className={`font-medium ${realTimeAmount.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {realTimeAmount.difference > 0 ? '+' : ''}{realTimeAmount.difference.toLocaleString('vi-VN')}đ so với dự kiến
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Tùy chọn 2: Dùng số tiền tính sẵn */}
                      <label className="flex items-start space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-green-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          checked={usePreCalculated && !useCustomAmount}
                          onChange={() => {
                            setUsePreCalculated(true);
                            setUseCustomAmount(false);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-green-700 text-sm">
                            Số tiền dự kiến
                            <span className="ml-2 text-base font-bold">
                              {booking.totalAmount.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Đã thanh toán trước / thỏa thuận riêng
                          </div>
                        </div>
                      </label>

                      {/* Tùy chọn 3: Tùy chỉnh giá */}
                      <label className="flex items-start space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-purple-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          checked={useCustomAmount}
                          onChange={() => {
                            setUseCustomAmount(true);
                            setUsePreCalculated(false);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-purple-700 text-sm">
                            Tùy chỉnh giá
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Nhập số tiền tùy chỉnh theo thỏa thuận
                          </div>
                          {useCustomAmount && (
                            <div className="mt-2">
                              <input
                                type="number"
                                min="0"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(Number(e.target.value))}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                placeholder="Nhập số tiền..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Phí phát sinh */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">
                    Phí phát sinh (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extraCharges}
                    onChange={(e) => setExtraCharges(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Phí làm hỏng đồ đạc, dịch vụ thêm...
                  </p>
                </div>

                {/* Ghi chú check-out */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">
                    Ghi chú check-out
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Tình trạng phòng, thiết bị..."
                  />
                </div>

                {/* Tổng tiền */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {useCustomAmount ? 'Giá tùy chỉnh:' : 'Tiền phòng:'}
                      </span>
                      <span>{getBaseAmount().toLocaleString('vi-VN')}đ</span>
                    </div>
                    {!useCustomAmount && extraCharges > 0 && (
                      <div className="flex justify-between">
                        <span>Phí phát sinh:</span>
                        <span>{extraCharges.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {useCustomAmount 
                          ? customAmount.toLocaleString('vi-VN')
                          : finalAmount.toLocaleString('vi-VN')
                        }đ
                      </span>
                    </div>
                    {useCustomAmount && (
                      <div className="text-xs text-purple-600 mt-1">
                        * Khi sử dụng giá tùy chỉnh, phí phát sinh sẽ không được tính thêm
                      </div>
                    )}
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
          </form>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 text-sm ${
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
        </div>
      </div>
    </div>
  );
}