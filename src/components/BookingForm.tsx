'use client';

import { useState, useEffect } from 'react';

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  monthlyPrice?: number; // Giá thuê theo tháng
  status: string;
}

interface Guest {
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  dateOfBirth: string; // Thêm ngày sinh
  address: string; // Thêm địa chỉ
}

interface BookingFormProps {
  onSubmit: (bookingData: any) => void;
  onCancel: () => void;
}

export default function BookingForm({ onSubmit, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    bookingType: 'individual' as 'individual' | 'company',
    roomId: '',
    rentalType: 'daily' as 'hourly' | 'daily' | 'monthly', // Loại thuê phòng
    checkInDate: '',
    checkOutDate: '',
    checkInTime: '', // Giờ vào (cho thuê theo giờ)
    checkOutTime: '', // Giờ ra (cho thuê theo giờ)
    
    // Thông tin đại diện
    representativeName: '',
    representativePhone: '',
    representativeEmail: '',
    representativeIdNumber: '',
    representativeDateOfBirth: '', // Thêm ngày sinh
    representativeAddress: '', // Thêm địa chỉ
    
    // Thông tin công ty (nếu booking type là company)
    companyName: '',
    companyAddress: '',
    companyTaxCode: '',
    
    // Danh sách khách (cho company booking)
    guests: [] as Guest[],
    
    // Ghi chú
    notes: '',
    
    // Điều chỉnh giá
    customPricing: false, // Có tùy chỉnh giá không
    customTotalAmount: 0, // Tổng tiền tùy chỉnh
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Load danh sách phòng available
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms?status=available');
        const data = await response.json();
        if (data.success) {
          setRooms(data.rooms);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { 
        name: '', 
        phone: '', 
        email: '', 
        idNumber: '',
        dateOfBirth: '',
        address: ''
      }]
    }));
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      )
    }));
  };

  const removeGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.roomId) newErrors.roomId = 'Vui lòng chọn phòng';
    
    // Validate based on rental type
    if (formData.rentalType === 'hourly') {
      if (!formData.checkInDate) newErrors.checkInDate = 'Vui lòng chọn ngày check-in';
      if (!formData.checkInTime) newErrors.checkInTime = 'Vui lòng chọn giờ vào';
      if (!formData.checkOutTime) newErrors.checkOutTime = 'Vui lòng chọn giờ ra';
      
      // Validate hours
      if (formData.checkInTime && formData.checkOutTime) {
        const checkInHour = parseInt(formData.checkInTime.split(':')[0]);
        const checkOutHour = parseInt(formData.checkOutTime.split(':')[0]);
        if (checkOutHour <= checkInHour) {
          newErrors.checkOutTime = 'Giờ ra phải sau giờ vào';
        }
      }
    } else {
      // Chỉ bắt buộc ngày check-in, check-out có thể để trống
      if (!formData.checkInDate) newErrors.checkInDate = 'Vui lòng chọn ngày check-in';
      
      // Validate dates if both are provided
      if (formData.checkInDate && formData.checkOutDate) {
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        if (checkOut <= checkIn) {
          newErrors.checkOutDate = 'Ngày check-out phải sau ngày check-in';
        }
      }
    }

    // Bắt buộc tên và CCCD cho admin
    if (!formData.representativeName.trim()) {
      newErrors.representativeName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.representativeIdNumber.trim()) {
      newErrors.representativeIdNumber = 'Vui lòng nhập CCCD/Passport';
    }

    // Validate company name if booking type is company
    if (formData.bookingType === 'company' && !formData.companyName) {
      newErrors.companyName = 'Vui lòng nhập tên công ty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms?.find(room => room._id === formData.roomId);

  // Hàm tính tiền theo loại thuê
  const calculateTotalAmount = () => {
    if (!selectedRoom) return 0;
    
    // Nếu có tùy chỉnh giá, dùng giá tùy chỉnh
    if (formData.customPricing && formData.customTotalAmount > 0) {
      return formData.customTotalAmount;
    }

    switch (formData.rentalType) {
      case 'hourly':
        if (!formData.checkInTime || !formData.checkOutTime) return 0;
        const checkInHour = parseInt(formData.checkInTime.split(':')[0]);
        const checkOutHour = parseInt(formData.checkOutTime.split(':')[0]);
        const totalHours = checkOutHour - checkInHour;
        
        if (totalHours <= 0) return 0;
        
        let hourlyTotal = 0;
        for (let i = 0; i < totalHours; i++) {
          if (i === 0) {
            hourlyTotal += 80000; // Giờ đầu tiên: 80k
          } else if (i === 1) {
            hourlyTotal += 40000; // Giờ thứ 2: 40k
          } else {
            hourlyTotal += 20000; // Giờ còn lại: 20k
          }
        }
        return hourlyTotal;

      case 'daily':
        if (!formData.checkInDate || !formData.checkOutDate) return 0;
        const days = Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
        return selectedRoom.price * days;

      case 'monthly':
        if (!formData.checkInDate || !formData.checkOutDate) return 0;
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        const months = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return (selectedRoom.monthlyPrice || selectedRoom.price * 25) * months; // Giá tháng hoặc giá ngày x25

      default:
        return 0;
    }
  };

  const getHourlyBreakdown = () => {
    if (!selectedRoom || formData.rentalType !== 'hourly' || !formData.checkInTime || !formData.checkOutTime) return [];
    
    const checkInHour = parseInt(formData.checkInTime.split(':')[0]);
    const checkOutHour = parseInt(formData.checkOutTime.split(':')[0]);
    const totalHours = checkOutHour - checkInHour;
    
    if (totalHours <= 0) return [];
    
    const breakdown = [];
    for (let i = 0; i < totalHours; i++) {
      if (i === 0) {
        breakdown.push({ hour: i + 1, price: 80000, label: 'Giờ đầu tiên' });
      } else if (i === 1) {
        breakdown.push({ hour: i + 1, price: 40000, label: 'Giờ thứ 2' });
      } else {
        breakdown.push({ hour: i + 1, price: 20000, label: `Giờ thứ ${i + 1}` });
      }
    }
    return breakdown;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Tạo Booking Mới</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loại Booking và Loại Thuê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại Booking</label>
                <select
                  value={formData.bookingType}
                  onChange={(e) => handleInputChange('bookingType', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Cá nhân</option>
                  <option value="company">Công ty</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại Thuê Phòng</label>
                <select
                  value={formData.rentalType}
                  onChange={(e) => {
                    handleInputChange('rentalType', e.target.value);
                    // Reset dates/times when changing rental type
                    if (e.target.value === 'hourly') {
                      handleInputChange('checkOutDate', '');
                    } else {
                      handleInputChange('checkInTime', '');
                      handleInputChange('checkOutTime', '');
                    }
                  }}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Theo giờ</option>
                  <option value="daily">Theo ngày</option>
                  <option value="monthly">Theo tháng</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phòng</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => handleInputChange('roomId', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.roomId ? 'border-red-500' : ''}`}
                >
                  <option value="">Chọn phòng</option>
                  {(rooms || []).map(room => (
                    <option key={room._id} value={room._id}>
                      Phòng {room.roomNumber} - {room.type} - {room.price.toLocaleString('vi-VN')} VND/ngày
                      {room.monthlyPrice && ` (${room.monthlyPrice.toLocaleString('vi-VN')} VND/tháng)`}
                    </option>
                  ))}
                </select>
                {errors.roomId && <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>}
              </div>
            </div>

            {/* Thời gian Check-in/Check-out */}
            {formData.rentalType === 'hourly' ? (
              // Thuê theo giờ
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày thuê</label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.checkInDate ? 'border-red-500' : ''}`}
                  />
                  {errors.checkInDate && <p className="text-red-500 text-sm mt-1">{errors.checkInDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Giờ vào</label>
                  <select
                    value={formData.checkInTime}
                    onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.checkInTime ? 'border-red-500' : ''}`}
                  >
                    <option value="">Chọn giờ vào</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                  {errors.checkInTime && <p className="text-red-500 text-sm mt-1">{errors.checkInTime}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Giờ ra</label>
                  <select
                    value={formData.checkOutTime}
                    onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.checkOutTime ? 'border-red-500' : ''}`}
                  >
                    <option value="">Chọn giờ ra</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                  {errors.checkOutTime && <p className="text-red-500 text-sm mt-1">{errors.checkOutTime}</p>}
                </div>
                
                {/* Hiển thị lưu ý giá theo giờ */}
                <div className="md:col-span-3 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Bảng giá theo giờ:</strong> Giờ đầu tiên: 80,000 VND • Giờ thứ 2: 40,000 VND • Các giờ tiếp theo: 20,000 VND/giờ
                  </p>
                </div>
              </div>
            ) : (
              // Thuê theo ngày/tháng
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.rentalType === 'monthly' ? 'Ngày bắt đầu thuê' : 'Ngày Check-in'}
                  </label>
                  <input
                    type={formData.rentalType === 'monthly' ? 'date' : 'datetime-local'}
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.checkInDate ? 'border-red-500' : ''}`}
                  />
                  {errors.checkInDate && <p className="text-red-500 text-sm mt-1">{errors.checkInDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.rentalType === 'monthly' ? 'Ngày kết thúc thuê' : 'Ngày Check-out'}
                  </label>
                  <input
                    type={formData.rentalType === 'monthly' ? 'date' : 'datetime-local'}
                    value={formData.checkOutDate}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.checkOutDate ? 'border-red-500' : ''}`}
                  />
                  {errors.checkOutDate && <p className="text-red-500 text-sm mt-1">{errors.checkOutDate}</p>}
                </div>
                
                {/* Hiển thị lưu ý giá theo tháng */}
                {formData.rentalType === 'monthly' && (
                  <div className="md:col-span-2 bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-700">
                      💡 <strong>Thuê theo tháng:</strong> Giá thuê tháng do admin tự do điều chỉnh dành riêng cho việc thuê phòng dài hạn
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Thông tin đại diện */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {formData.bookingType === 'company' ? 'Thông tin liên hệ' : 'Thông tin người đại diện'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên đại diện BẮT BUỘC */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên đại diện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.representativeName}
                    onChange={(e) => handleInputChange('representativeName', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.representativeName ? 'border-red-500' : ''}`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.representativeName && <p className="text-red-500 text-sm mt-1">{errors.representativeName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.representativePhone}
                    onChange={(e) => handleInputChange('representativePhone', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Có thể nhập sau"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.representativeEmail}
                    onChange={(e) => handleInputChange('representativeEmail', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Có thể nhập sau"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    CCCD/CMND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.representativeIdNumber}
                    onChange={(e) => handleInputChange('representativeIdNumber', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.representativeIdNumber ? 'border-red-500' : ''}`}
                    placeholder="Nhập số CCCD/Passport"
                  />
                  {errors.representativeIdNumber && <p className="text-red-500 text-sm mt-1">{errors.representativeIdNumber}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.representativeDateOfBirth}
                    onChange={(e) => handleInputChange('representativeDateOfBirth', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Địa chỉ thường trú
                  </label>
                  <textarea
                    value={formData.representativeAddress}
                    onChange={(e) => handleInputChange('representativeAddress', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin công ty (chỉ hiện khi bookingType = company) */}
            {formData.bookingType === 'company' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Thông tin công ty</h3>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Lưu ý:</strong> Thông tin liên hệ có thể để trống và cập nhật sau. 
                    Chỉ cần điền tên công ty để tạo booking.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên công ty *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-500' : ''}`}
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Mã số thuế</label>
                    <input
                      type="text"
                      value={formData.companyTaxCode}
                      onChange={(e) => handleInputChange('companyTaxCode', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Địa chỉ công ty</label>
                    <input
                      type="text"
                      value={formData.companyAddress}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Danh sách khách (chỉ hiện khi bookingType = company) */}
            {formData.bookingType === 'company' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Danh sách khách</h3>
                  <button
                    type="button"
                    onClick={addGuest}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    + Thêm khách
                  </button>
                </div>
                
                {errors.guests && <p className="text-red-500 text-sm mb-4">{errors.guests}</p>}
                
                {formData.guests.map((guest, index) => (
                  <div key={index} className="border p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Khách #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeGuest(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tên</label>
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) => updateGuest(index, 'name', e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">CCCD/CMND</label>
                        <input
                          type="text"
                          value={guest.idNumber}
                          onChange={(e) => updateGuest(index, 'idNumber', e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          value={guest.dateOfBirth}
                          onChange={(e) => updateGuest(index, 'dateOfBirth', e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Điện thoại</label>
                        <input
                          type="tel"
                          value={guest.phone}
                          onChange={(e) => updateGuest(index, 'phone', e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={guest.email}
                          onChange={(e) => updateGuest(index, 'email', e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                        <textarea
                          value={guest.address}
                          onChange={(e) => updateGuest(index, 'address', e.target.value)}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium mb-2">Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú thêm về booking..."
              />
            </div>

            {/* Tổng tiền dự kiến */}
            {selectedRoom && (
              (formData.rentalType === 'hourly' && formData.checkInDate && formData.checkInTime && formData.checkOutTime) ||
              (formData.rentalType !== 'hourly' && formData.checkInDate && formData.checkOutDate)
            ) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Thông tin thanh toán</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Phòng {selectedRoom.roomNumber} ({selectedRoom.type})</span>
                    <span>
                      {formData.rentalType === 'hourly' 
                        ? 'Theo giờ' 
                        : formData.rentalType === 'monthly'
                        ? `${(selectedRoom.monthlyPrice || selectedRoom.price * 25).toLocaleString('vi-VN')} VND/tháng`
                        : `${selectedRoom.price.toLocaleString('vi-VN')} VND/ngày`
                      }
                    </span>
                  </div>
                  
                  {formData.rentalType === 'hourly' && (
                    <>
                      <div className="flex justify-between">
                        <span>Thời gian</span>
                        <span>
                          {formData.checkInTime} - {formData.checkOutTime} 
                          ({parseInt(formData.checkOutTime.split(':')[0]) - parseInt(formData.checkInTime.split(':')[0])} giờ)
                        </span>
                      </div>
                      
                      {/* Chi tiết giá theo giờ */}
                      {getHourlyBreakdown().map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                          <span>  • {item.label}</span>
                          <span>{item.price.toLocaleString('vi-VN')} VND</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {formData.rentalType === 'daily' && (
                    <div className="flex justify-between">
                      <span>Số ngày</span>
                      <span>
                        {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                      </span>
                    </div>
                  )}
                  
                  {formData.rentalType === 'monthly' && (
                    <div className="flex justify-between">
                      <span>Số tháng</span>
                      <span>
                        {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} tháng
                      </span>
                    </div>
                  )}
                  
                  {/* Tùy chỉnh giá */}
                  <div className="border-t pt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="customPricing"
                        checked={formData.customPricing}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleInputChange('customPricing', checked);
                          if (!checked) {
                            handleInputChange('customTotalAmount', 0);
                          } else {
                            handleInputChange('customTotalAmount', calculateTotalAmount());
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="customPricing" className="text-sm font-medium text-gray-700">
                        Điều chỉnh giá
                      </label>
                    </div>
                    
                    {formData.customPricing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tổng tiền tùy chỉnh (VND)
                        </label>
                        <input
                          type="number"
                          value={formData.customTotalAmount}
                          onChange={(e) => handleInputChange('customTotalAmount', Number(e.target.value))}
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập tổng tiền"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Giá gốc: {calculateTotalAmount().toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Tổng tiền</span>
                    <span className="text-blue-600">
                      {(formData.customPricing ? formData.customTotalAmount : calculateTotalAmount()).toLocaleString('vi-VN')} VND
                      {formData.customPricing && formData.customTotalAmount !== calculateTotalAmount() && (
                        <span className="text-sm text-orange-600 block">
                          (Đã điều chỉnh)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
