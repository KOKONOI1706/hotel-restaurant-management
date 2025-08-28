'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  StarIcon,
  WifiIcon,
  TvIcon,
  HomeIcon,
  UserGroupIcon,
  SparklesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'cleaning';
  price: number;
  monthlyPrice?: number;
  description: string;
  amenities: string[];
  images?: string[];
  rating?: number;
  reviewCount?: number;
  currentBooking?: any;
}

interface Filters {
  type: string;
  priceRange: string;
  guests: string;
  search: string;
}

export default function CustomerRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: '',
    priceRange: '',
    guests: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'size'>('price');

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      if (!isClient) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/rooms?status=available');
        const data = await response.json();
        
        if (data.success) {
          // Map the rooms data to include mock images and ratings for customer view
          const mappedRooms = data.rooms.map((room: any) => ({
            ...room,
            images: getDefaultRoomImages(room.type),
            rating: getDefaultRating(room.type),
            reviewCount: getDefaultReviewCount(room.type)
          }));
          setRooms(mappedRooms);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isClient]);

  // Safe render function chỉ render sau khi client ready
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper functions for default data
  const getDefaultRoomImages = (type: string) => {
    const imageMap: { [key: string]: string[] } = {
      single: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      double: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      suite: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      deluxe: [
        'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    };
    return imageMap[type] || imageMap.single;
  };

  const getDefaultRating = (type: string) => {
    const ratingMap: { [key: string]: number } = {
      single: 4.2,
      double: 4.5,
      suite: 4.7,
      deluxe: 4.8
    };
    return ratingMap[type] || 4.0;
  };

  const getDefaultReviewCount = (type: string) => {
    const reviewMap: { [key: string]: number } = {
      single: 45,
      double: 67,
      suite: 34,
      deluxe: 89
    };
    return reviewMap[type] || 20;
  };

  const getRoomTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      single: 'Phòng Single',
      double: 'Phòng Double', 
      suite: 'Phòng Suite',
      deluxe: 'Phòng Deluxe'
    };
    return typeMap[type] || type;
  };

  const getMaxGuests = (type: string) => {
    const guestMap: { [key: string]: number } = {
      single: 1,
      double: 2,
      suite: 4,
      deluxe: 4
    };
    return guestMap[type] || 2;
  };

  const getRoomSize = (type: string) => {
    const sizeMap: { [key: string]: number } = {
      single: 20,
      double: 30,
      suite: 50,
      deluxe: 60
    };
    return sizeMap[type] || 25;
  };

  const roomTypes = [
    { value: '', label: 'Tất cả loại phòng' },
    { value: 'single', label: 'Phòng Single' },
    { value: 'double', label: 'Phòng Double' },
    { value: 'suite', label: 'Phòng Suite' },
    { value: 'deluxe', label: 'Phòng Deluxe' }
  ];

  const priceRanges = [
    { value: '', label: 'Tất cả mức giá' },
    { value: '0-1000000', label: 'Dưới 1 triệu' },
    { value: '1000000-2000000', label: '1-2 triệu' },
    { value: '2000000-5000000', label: '2-5 triệu' },
    { value: '5000000-10000000', label: '5-10 triệu' },
    { value: '10000000+', label: 'Trên 10 triệu' }
  ];

  const guestOptions = [
    { value: '', label: 'Tất cả' },
    { value: '1', label: '1 khách' },
    { value: '2', label: '2 khách' },
    { value: '3', label: '3 khách' },
    { value: '4', label: '4+ khách' }
  ];

  const sortOptions = [
    { value: 'price', label: 'Giá thấp đến cao' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'size', label: 'Diện tích lớn nhất' }
  ];

  // Filter và sort logic
  const filteredRooms = rooms
    .filter(room => {
      const matchesType = !filters.type || room.type === filters.type;
      const matchesSearch = !filters.search || 
        room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        getRoomTypeName(room.type).toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesPrice = !filters.priceRange || (() => {
        if (filters.priceRange === '10000000+') return room.price >= 10000000;
        const [min, max] = filters.priceRange.split('-').map(Number);
        return room.price >= min && (!max || room.price <= max);
      })();
      
      const roomMaxGuests = getMaxGuests(room.type);
      const matchesGuests = !filters.guests || roomMaxGuests >= parseInt(filters.guests);
      
      return matchesType && matchesSearch && matchesPrice && matchesGuests;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'size':
          return getRoomSize(b.type) - getRoomSize(a.type);
        case 'price':
        default:
          return a.price - b.price;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarSolid
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning={true}>
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50" suppressHydrationWarning={true}>
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
              <span className="text-blue-600 font-medium">Phòng</span>
              <Link href="/customer/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Dịch vụ
              </Link>
              <Link href="/customer/reviews" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Đánh giá
              </Link>
            </nav>

            <Link 
              href="/customer/booking"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              Đặt phòng
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Phòng nghỉ cao cấp
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Khám phá những căn phòng tuyệt đẹp tại Suối Mơ Resort với đầy đủ tiện nghi hiện đại
          </p>
        </div>
      </section>

      {/* Search và Filters */}
      <section className="py-8 bg-white shadow-sm" suppressHydrationWarning={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Tìm kiếm phòng..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roomTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Guests Filter */}
            <div>
              <select
                value={filters.guests}
                onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {guestOptions.map(guest => (
                  <option key={guest.value} value={guest.value}>{guest.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-600">
              Tìm thấy {filteredRooms.length} phòng
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isClient || loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải phòng...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" suppressHydrationWarning={true}>
              {filteredRooms.map((room) => (
                <div key={room._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Room Images */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.images?.[0] || getDefaultRoomImages(room.type)[0]}
                      alt={getRoomTypeName(room.type)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-900">
                        Phòng {room.roomNumber}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="flex items-center space-x-1" suppressHydrationWarning={true}>
                        {renderStars(room.rating || 4.0)}
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {room.rating?.toFixed(1) || '4.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {getRoomTypeName(room.type)}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {getMaxGuests(room.type)} khách
                      </div>
                      <div className="flex items-center">
                        <HomeIcon className="h-4 w-4 mr-1" />
                        {getRoomSize(room.type)}m²
                      </div>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 mr-1" />
                        {room.reviewCount || 20} đánh giá
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{room.amenities.length - 3} tiện ích khác
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price và Action */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {room.price.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-sm text-gray-500">
                          /đêm
                        </div>
                        {room.monthlyPrice && (
                          <div className="text-sm text-green-600">
                            {room.monthlyPrice.toLocaleString('vi-VN')}đ/tháng
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/customer/rooms/${room._id}`}
                          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          href={`/customer/booking?roomId=${room._id}`}
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                        >
                          Đặt ngay
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isClient && !loading && filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy phòng nào</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc để xem thêm phòng</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tiện ích đẳng cấp
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mỗi phòng tại Suối Mơ đều được trang bị đầy đủ tiện nghi hiện đại để mang đến trải nghiệm hoàn hảo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WiFi Tốc Độ Cao</h3>
              <p className="text-gray-600">Kết nối internet không giới hạn với tốc độ cao</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TvIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart TV</h3>
              <p className="text-gray-600">TV thông minh với nhiều kênh giải trí đa dạng</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thiết Kế Sang Trọng</h3>
              <p className="text-gray-600">Nội thất cao cấp và thiết kế hiện đại</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng đặt phòng?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Liên hệ với chúng tôi để được tư vấn và đặt phòng với giá tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/customer/booking"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Đặt phòng ngay
            </Link>
            <a 
              href="tel:+842631234567"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Hotline: 0263 123 4567
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
