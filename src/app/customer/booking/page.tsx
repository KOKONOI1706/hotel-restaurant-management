'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'cleaning';
  price: number;
  monthlyPrice?: number;
  description: string;
  amenities: string[];
}

interface Service {
  _id: string;
  name: string;
  description: string;
  category: 'food' | 'beverage' | 'spa' | 'laundry' | 'transport' | 'other';
  price: number;
  status: 'available' | 'unavailable';
}

interface BookingForm {
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomId: string;
  specialRequests: string;
  services: string[];
  idNumber: string;
  bookingType: 'individual' | 'company';
  companyName?: string;
  companyTaxCode?: string;
}

export default function CustomerBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    roomId: '',
    specialRequests: '',
    services: [],
    bookingType: 'individual',
    companyName: '',
    companyTaxCode: ''
  });

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch rooms and services
  useEffect(() => {
    const fetchData = async () => {
      if (!isClient) return;
      
      try {
        setLoading(true);
        
        // Fetch available rooms
        const roomsResponse = await fetch('/api/rooms?status=available');
        const roomsData = await roomsResponse.json();
        
        // Fetch available services
        const servicesResponse = await fetch('/api/services?status=available');
        const servicesData = await servicesResponse.json();
        
        if (roomsData.success) {
          setRooms(roomsData.rooms || roomsData.data || []);
        }
        
        if (servicesData.success) {
          setServices(servicesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isClient]);

  // Early return nếu chưa hydrate
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper functions
  const getRoomTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      single: 'Phòng Standard',
      double: 'Phòng Double', 
      suite: 'Phòng Suite',
      deluxe: 'Phòng Deluxe'
    };
    return typeMap[type] || 'Phòng';
  };

  const getRoomTypeImage = (type: string) => {
    const imageMap: { [key: string]: string } = {
      single: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      double: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      deluxe: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    return imageMap[type] || imageMap.single;
  };

  const getRoomFeatures = (room: Room) => {
    const baseFeatures = [
      `Phòng ${room.roomNumber}`,
      `Giá ${room.price.toLocaleString('vi-VN')}đ/đêm`,
      'Wifi miễn phí',
      'Điều hòa'
    ];
    
    if (room.amenities && room.amenities.length > 0) {
      return [...baseFeatures, ...room.amenities.slice(0, 2)];
    }
    
    return baseFeatures;
  };

  const steps = [
    { number: 1, title: 'Thông tin cá nhân', description: 'Nhập thông tin liên hệ' },
    { number: 2, title: 'Chi tiết đặt phòng', description: 'Chọn phòng và thời gian' },
    { number: 3, title: 'Dịch vụ bổ sung', description: 'Tùy chọn dịch vụ thêm' },
    { number: 4, title: 'Xác nhận', description: 'Kiểm tra và thanh toán' }
  ];

  const calculateTotal = () => {
    const selectedRoom = rooms.find(room => room._id === bookingForm.roomId);
    const roomPrice = selectedRoom ? selectedRoom.price : 0;
    
    const checkInDate = new Date(bookingForm.checkIn);
    const checkOutDate = new Date(bookingForm.checkOut);
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const servicesPrice = bookingForm.services.reduce((total, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);

    return {
      roomTotal: roomPrice * nights,
      servicesTotal: servicesPrice,
      nights,
      grandTotal: (roomPrice * nights) + servicesPrice,
      selectedRoom
    };
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return 'Vui lòng nhập số điện thoại';
    }
    if (!/^[0-9]{10,11}$/.test(phone.trim())) {
      return 'Số điện thoại không hợp lệ (10-11 số)';
    }
    return '';
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Vui lòng nhập họ và tên';
    }
    return '';
  };

  const validateStep = (step: number) => {
    const errors: {[key: string]: string} = {};
    
    if (step === 1) {
      // Bắt buộc tên và số điện thoại cho customer
      const nameError = validateName(bookingForm.fullName);
      if (nameError) {
        errors.fullName = nameError;
      }
      
      const phoneError = validatePhone(bookingForm.phone);
      if (phoneError) {
        errors.phone = phoneError;
      }
    }
    
    if (step === 2) {
      // Chỉ bắt buộc ngày check-in
      if (!bookingForm.checkIn) {
        errors.checkIn = 'Vui lòng chọn ngày nhận phòng';
      }
      
      if (!bookingForm.roomId) {
        errors.roomId = 'Vui lòng chọn phòng';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form trước khi submit
    if (!validateStep(1)) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      setCurrentStep(1);
      return;
    }

    if (!validateStep(2)) {
      alert('Vui lòng chọn ngày nhận phòng và phòng!');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedRoom = rooms.find(room => room._id === bookingForm.roomId);
      if (!selectedRoom) {
        alert('Vui lòng chọn phòng!');
        return;
      }

      // Validate tên và số điện thoại
      if (!bookingForm.fullName.trim()) {
        alert('Vui lòng nhập họ và tên!');
        return;
      }
      
      if (!bookingForm.phone.trim()) {
        alert('Vui lòng nhập số điện thoại!');
        return;
      }

      // Chỉ validate ngày check-in
      if (!bookingForm.checkIn) {
        alert('Vui lòng chọn ngày nhận phòng!');
        return;
      }

      if (!bookingForm.roomId) {
        alert('Vui lòng chọn phòng!');
        return;
      }

      // Prepare booking data with all required fields
      const bookingData = {
        bookingType: bookingForm.bookingType,
        rentalType: 'daily', // Mặc định thuê theo ngày
        roomId: bookingForm.roomId,
        roomNumber: selectedRoom.roomNumber, // Thêm roomNumber
        representativeName: bookingForm.fullName || 'Khách hàng',
        representativePhone: bookingForm.phone,
        representativeCCCD: bookingForm.idNumber || 'Chưa cập nhật',
        representativeEmail: bookingForm.email || 'Chưa cập nhật',
        companyName: bookingForm.bookingType === 'company' ? (bookingForm.companyName || 'Công ty') : undefined,
        companyTaxCode: bookingForm.bookingType === 'company' ? bookingForm.companyTaxCode : undefined,
        guests: [{
          name: bookingForm.fullName || 'Khách hàng',
          phone: bookingForm.phone,
          email: bookingForm.email || 'Chưa cập nhật',
          cccd: bookingForm.idNumber || 'Chưa cập nhật'
        }],
        checkInDate: new Date(bookingForm.checkIn).toISOString(), // Convert to ISO string
        checkOutDate: bookingForm.checkOut ? new Date(bookingForm.checkOut).toISOString() : undefined, // Có thể để trống
        notes: bookingForm.specialRequests,
        totalAmount: 0, // Sẽ được tính trong API
        createdBy: 'customer' // Thêm trường bắt buộc
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Đặt phòng thành công! Mã đặt phòng: ${result.data._id.slice(-8)}\nChúng tôi sẽ liên hệ với bạn sớm nhất.`);
        
        // Reset form
        setBookingForm({
          fullName: '',
          email: '',
          phone: '',
          idNumber: '',
          checkIn: '',
          checkOut: '',
          adults: 2,
          children: 0,
          roomId: '',
          specialRequests: '',
          services: [],
          bookingType: 'individual',
          companyName: '',
          companyTaxCode: ''
        });
        setCurrentStep(1);
      } else {
        console.error('Booking API error:', result);
        alert(`Lỗi: ${result.message || 'Không thể đặt phòng'}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
      
      {/* Booking Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Loại đặt phòng *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
            bookingForm.bookingType === 'individual'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="bookingType"
              value="individual"
              checked={bookingForm.bookingType === 'individual'}
              onChange={(e) => setBookingForm({ ...bookingForm, bookingType: e.target.value as 'individual' | 'company' })}
              className="sr-only"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Cá nhân</h4>
              <p className="text-sm text-gray-600">Đặt phòng cho cá nhân/gia đình</p>
            </div>
            {bookingForm.bookingType === 'individual' && (
              <CheckCircleIcon className="h-6 w-6 text-blue-500" />
            )}
          </label>
          
          <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
            bookingForm.bookingType === 'company'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="bookingType"
              value="company"
              checked={bookingForm.bookingType === 'company'}
              onChange={(e) => setBookingForm({ ...bookingForm, bookingType: e.target.value as 'individual' | 'company' })}
              className="sr-only"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Công ty</h4>
              <p className="text-sm text-gray-600">Đặt phòng cho doanh nghiệp</p>
            </div>
            {bookingForm.bookingType === 'company' && (
              <CheckCircleIcon className="h-6 w-6 text-blue-500" />
            )}
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bookingForm.fullName}
            onChange={(e) => {
              setBookingForm({ ...bookingForm, fullName: e.target.value });
              // Clear error when user starts typing
              if (validationErrors.fullName) {
                setValidationErrors({ ...validationErrors, fullName: '' });
              }
            }}
            onBlur={() => {
              const nameError = validateName(bookingForm.fullName);
              if (nameError) {
                setValidationErrors({ ...validationErrors, fullName: nameError });
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập họ và tên"
          />
          {validationErrors.fullName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={bookingForm.email}
            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="example@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={bookingForm.phone}
            onChange={(e) => {
              setBookingForm({ ...bookingForm, phone: e.target.value });
              // Clear error when user starts typing
              if (validationErrors.phone) {
                setValidationErrors({ ...validationErrors, phone: '' });
              }
            }}
            onBlur={() => {
              const phoneError = validatePhone(bookingForm.phone);
              if (phoneError) {
                setValidationErrors({ ...validationErrors, phone: phoneError });
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0123 456 789"
            required
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CCCD/Passport
          </label>
          <input
            type="text"
            value={bookingForm.idNumber}
            onChange={(e) => setBookingForm({ ...bookingForm, idNumber: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Số CCCD hoặc Passport"
          />
        </div>
      </div>

      {/* Company Info (if company booking) */}
      {bookingForm.bookingType === 'company' && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
          <h4 className="font-semibold text-blue-900">Thông tin công ty</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên công ty *
              </label>
              <input
                type="text"
                value={bookingForm.companyName}
                onChange={(e) => setBookingForm({ ...bookingForm, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên công ty"
                required={bookingForm.bookingType === 'company'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã số thuế
              </label>
              <input
                type="text"
                value={bookingForm.companyTaxCode}
                onChange={(e) => setBookingForm({ ...bookingForm, companyTaxCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mã số thuế"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết đặt phòng</h3>
      
      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày nhận phòng *
          </label>
          <input
            type="date"
            value={bookingForm.checkIn}
            onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày trả phòng *
          </label>
          <input
            type="date"
            value={bookingForm.checkOut}
            onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      {/* Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số người lớn
          </label>
          <select
            value={bookingForm.adults}
            onChange={(e) => setBookingForm({ ...bookingForm, adults: Number(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1,2,3,4,5,6].map(num => (
              <option key={num} value={num}>{num} người</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số trẻ em
          </label>
          <select
            value={bookingForm.children}
            onChange={(e) => setBookingForm({ ...bookingForm, children: Number(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[0,1,2,3,4].map(num => (
              <option key={num} value={num}>{num} trẻ em</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Chọn phòng *
        </label>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Đang tải danh sách phòng...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Không có phòng trống trong thời gian này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div
                key={room._id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  bookingForm.roomId === room._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setBookingForm({ ...bookingForm, roomId: room._id })}
              >
                <img
                  src={getRoomTypeImage(room.type)}
                  alt={getRoomTypeName(room.type)}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {getRoomTypeName(room.type)} - {room.roomNumber}
                </h4>
                <p className="text-lg font-bold text-blue-600 mb-2">
                  {room.price.toLocaleString('vi-VN')}đ/đêm
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {getRoomFeatures(room).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {room.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {room.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yêu cầu đặc biệt
        </label>
        <textarea
          value={bookingForm.specialRequests}
          onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Ví dụ: Tầng cao, không hút thuốc, giường tách đôi..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Dịch vụ bổ sung</h3>
      <p className="text-gray-600 mb-6">Chọn các dịch vụ bổ sung để hoàn thiện trải nghiệm của bạn</p>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải dịch vụ...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Không có dịch vụ bổ sung nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <label
              key={service._id}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                bookingForm.services.includes(service._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={bookingForm.services.includes(service._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setBookingForm({
                      ...bookingForm,
                      services: [...bookingForm.services, service._id]
                    });
                  } else {
                    setBookingForm({
                      ...bookingForm,
                      services: bookingForm.services.filter(id => id !== service._id)
                    });
                  }
                }}
                className="sr-only"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                {service.description && (
                  <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                )}
                <p className="text-blue-600 font-semibold">
                  +{service.price.toLocaleString('vi-VN')}đ
                </p>
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 mt-1">
                  {service.category}
                </span>
              </div>
              {bookingForm.services.includes(service._id) && (
                <CheckCircleIcon className="h-6 w-6 text-blue-500" />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const { roomTotal, servicesTotal, nights, grandTotal, selectedRoom } = calculateTotal();
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Xác nhận đặt phòng</h3>
        
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Thông tin đặt phòng</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loại đặt phòng:</span>
              <span className="font-medium">
                {bookingForm.bookingType === 'individual' ? 'Cá nhân' : 'Công ty'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Họ tên:</span>
              <span className="font-medium">{bookingForm.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{bookingForm.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điện thoại:</span>
              <span className="font-medium">{bookingForm.phone}</span>
            </div>
            {bookingForm.idNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">CCCD/Passport:</span>
                <span className="font-medium">{bookingForm.idNumber}</span>
              </div>
            )}
            {bookingForm.bookingType === 'company' && bookingForm.companyName && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Công ty:</span>
                  <span className="font-medium">{bookingForm.companyName}</span>
                </div>
                {bookingForm.companyTaxCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã số thuế:</span>
                    <span className="font-medium">{bookingForm.companyTaxCode}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Nhận phòng:</span>
              <span className="font-medium">
                {new Date(bookingForm.checkIn).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trả phòng:</span>
              <span className="font-medium">
                {new Date(bookingForm.checkOut).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số đêm:</span>
              <span className="font-medium">{nights} đêm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Khách:</span>
              <span className="font-medium">{bookingForm.adults} người lớn, {bookingForm.children} trẻ em</span>
            </div>
            {selectedRoom && (
              <div className="flex justify-between">
                <span className="text-gray-600">Phòng:</span>
                <span className="font-medium">
                  {getRoomTypeName(selectedRoom.type)} - {selectedRoom.roomNumber}
                </span>
              </div>
            )}
            {bookingForm.specialRequests && (
              <div className="flex justify-between">
                <span className="text-gray-600">Yêu cầu đặc biệt:</span>
                <span className="font-medium">{bookingForm.specialRequests}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Chi tiết chi phí</h4>
          
          <div className="space-y-3">
            {selectedRoom && (
              <div className="flex justify-between">
                <span>{getRoomTypeName(selectedRoom.type)} - {selectedRoom.roomNumber} × {nights} đêm</span>
                <span className="font-medium">{roomTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            
            {bookingForm.services.length > 0 && (
              <>
                <div className="text-sm text-gray-600 font-medium">Dịch vụ bổ sung:</div>
                {bookingForm.services.map(serviceId => {
                  const service = services.find(s => s._id === serviceId);
                  return service ? (
                    <div key={serviceId} className="flex justify-between text-sm">
                      <span className="ml-4">{service.name}</span>
                      <span>{service.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                  ) : null;
                })}
              </>
            )}
            
            <hr className="border-gray-200" />
            <div className="flex justify-between text-lg font-bold text-blue-600">
              <span>Tổng cộng</span>
              <span>{grandTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h4>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" defaultChecked />
              <CreditCardIcon className="h-5 w-5 mr-3 text-gray-600" />
              <span>Thanh toán tại resort</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" className="mr-3" />
              <CreditCardIcon className="h-5 w-5 mr-3 text-gray-600" />
              <span>Chuyển khoản ngân hàng</span>
            </label>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-yellow-50 rounded-xl p-4">
          <label className="flex items-start">
            <input type="checkbox" className="mt-1 mr-3" required />
            <span className="text-sm text-gray-700">
              Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">điều khoản sử dụng</a> và 
              <a href="#" className="text-blue-600 hover:underline"> chính sách hủy phòng</a> của Suối Mơ Resort.
            </span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/customer" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Suối Mơ
                </h1>
                <p className="text-sm text-gray-600">Resort & Spa</p>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link href="/customer" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Trang chủ
              </Link>
              <Link href="/customer/rooms" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Phòng
              </Link>
              <Link href="/customer/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Dịch vụ
              </Link>
              <Link href="/customer/reviews" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Đánh giá
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Đặt phòng tại Suối Mơ</h1>
          <p className="text-xl text-blue-100">
            Hoàn tất thông tin để có trải nghiệm nghỉ dưỡng tuyệt vời
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.number}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p className={`font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={currentStep === 1}
              >
                Quay lại
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => {
                    // Validate current step before moving to next
                    if (currentStep === 1) {
                      if (!validateStep(1)) {
                        return; // Don't proceed if validation fails
                      }
                    }
                    if (currentStep === 2) {
                      if (!validateStep(2)) {
                        return; // Don't proceed if validation fails
                      }
                    }
                    setCurrentStep(Math.min(4, currentStep + 1));
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận đặt phòng'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cần hỗ trợ?</h2>
          <p className="text-gray-600 mb-6">
            Đội ngũ tư vấn của chúng tôi sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+842631234567"
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PhoneIcon className="h-5 w-5 mr-2" />
              Hotline: 0399 13 5959
            </a>
            <a 
              href="mailto:booking@suoimoresort.com"
              className="flex items-center justify-center border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Email: booking@suoimoresort.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
