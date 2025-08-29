'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  HeartIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface Service {
  _id: string;
  name: string;
  description: string;
  category: 'food' | 'beverage' | 'spa' | 'laundry' | 'transport' | 'other';
  price: number;
  status: 'available' | 'unavailable';
  createdAt: string;
  updatedAt: string;
  // Thêm các field cho customer view
  duration?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  popular?: boolean;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  serviceId: string;
}

export default function CustomerServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch services from API - giống như trang admin
  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('isActive', 'true'); // Chỉ lấy dịch vụ đang hoạt động
      params.append('sortBy', 'name');
      
      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        // Thêm thông tin bổ sung cho customer view
        const servicesWithExtras = data.data.map((service: Service) => ({
          ...service,
          duration: getDefaultDuration(service.category),
          image: getDefaultImage(service.category),
          rating: getDefaultRating(service.category),
          reviewCount: Math.floor(Math.random() * 200) + 50,
          popular: Math.random() > 0.6 // Random popular
        }));
        setServices(servicesWithExtras);
      } else {
        console.error('Failed to fetch services:', data.message);
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchServices();
    }
  }, [isClient, selectedCategory]);

  // Helper functions cho customer view
  const getDefaultDuration = (category: string): number => {
    switch (category) {
      case 'food': return 120;
      case 'spa': return 90;
      case 'transport': return 60;
      case 'laundry': return 480;
      case 'beverage': return 15;
      case 'other': return 120;
      default: return 60;
    }
  };

  const getDefaultImage = (category: string): string => {
    switch (category) {
      case 'food': return 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80';
      case 'spa': return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
      case 'transport': return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
      case 'laundry': return 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
      case 'beverage': return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
      case 'other': return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
      default: return 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80';
    }
  };

  const getDefaultRating = (category: string): number => {
    switch (category) {
      case 'food': return 4.6;
      case 'spa': return 4.8;
      case 'transport': return 4.4;
      case 'laundry': return 4.3;
      case 'beverage': return 4.5;
      case 'other': return 4.6;
      default: return 4.5;
    }
  };

  // Mock reviews data
  useEffect(() => {
    if (isClient) {
      const mockReviews: Review[] = [
        {
          id: '1',
          customerName: 'Nguyễn Thị Lan',
          rating: 5,
          comment: 'Dịch vụ tuyệt vời, nhân viên chu đáo và chuyên nghiệp.',
          date: '2025-08-25',
          serviceId: '1'
        },
        {
          id: '2',
          customerName: 'Trần Minh Đức',
          rating: 5,
          comment: 'Chất lượng dịch vụ rất tốt, sẽ sử dụng lại.',
          date: '2025-08-24',
          serviceId: '2'
        },
        {
          id: '3',
          customerName: 'Lê Hoàng Nam',
          rating: 4,
          comment: 'Hài lòng với dịch vụ, giá cả hợp lý.',
          date: '2025-08-23',
          serviceId: '3'
        }
      ];
      setReviews(mockReviews);
    }
  }, [isClient]);

  const categories = [
    { value: '', label: 'Tất cả dịch vụ', icon: '🎯' },
    { value: 'food', label: 'Ăn uống', icon: '🍽️' },
    { value: 'beverage', label: 'Đồ uống', icon: '🍹' },
    { value: 'spa', label: 'Spa', icon: '🧘‍♀️' },
    { value: 'transport', label: 'Vận chuyển', icon: '🚗' },
    { value: 'laundry', label: 'Giặt ủi', icon: '👔' },
    { value: 'other', label: 'Dịch vụ khác', icon: '🎵' }
  ];

  const filteredServices = services.filter(service => 
    !selectedCategory || service.category === selectedCategory
  );

  const popularServices = services.filter(service => service.popular);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarSolid
        key={index}
        className={`h-5 w-5 ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours}h`;
  };

  const getServiceReviews = (serviceId: string) => {
    return reviews.filter(review => review.serviceId === serviceId);
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
              <Link href="/customer/rooms" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Phòng
              </Link>
              <span className="text-blue-600 font-medium">Dịch vụ</span>
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
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Dịch vụ cao cấp
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Trải nghiệm những dịch vụ tuyệt vời nhất tại Suối Mơ Resort với chất lượng 5 sao
          </p>
        </div>
      </section>

      {/* Popular Services */}
      {isClient && !loading && popularServices.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dịch vụ phổ biến</h2>
              <p className="text-gray-600">Những dịch vụ được khách hàng yêu thích nhất</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularServices.map((service) => (
                <div key={service._id} className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-4 right-4">
                    <HeartIcon className="h-6 w-6 text-red-500 fill-current" />
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(service.rating || 4.5)}
                      <span className="text-sm font-medium text-gray-700 ml-1">
                        {service.rating || 4.5} ({service.reviewCount || 0})
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-blue-600">
                      {service.price.toLocaleString('vi-VN')}đ
                    </div>
                    <Link
                      href={`/customer/services/${service._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Đặt ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isClient || loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dịch vụ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div key={service._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {service.popular && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Phổ biến
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="flex items-center space-x-1">
                        {renderStars(service.rating || 4.5)}
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {service.rating || 4.5}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                    {/* Service Details */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      {service.duration && (
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDuration(service.duration)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 mr-1" />
                        {service.reviewCount || 0} đánh giá
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {service.price.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/customer/services/${service._id}`}
                          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          href={`/customer/booking?serviceId=${service._id}`}
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

          {isClient && !loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có dịch vụ nào</h3>
              <p className="text-gray-600">Thử chọn danh mục khác để xem thêm dịch vụ</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Reviews */}
      {isClient && !loading && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Đánh giá gần đây</h2>
              <p className="text-gray-600">Ý kiến từ khách hàng đã trải nghiệm dịch vụ</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => {
                const service = services.find(s => s._id === review.serviceId);
                return (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {review.customerName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3 italic">"{review.comment}"</p>
                    {service && (
                      <p className="text-sm text-blue-600 font-medium">{service.name}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link 
                href="/customer/reviews"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả đánh giá
                <StarIcon className="h-5 w-5 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Cần tư vấn dịch vụ?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Liên hệ với chúng tôi để được tư vấn và đặt lịch dịch vụ phù hợp nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+84399135959"
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Hotline: 0399 13 5959
            </a>
            <Link 
              href="/customer/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              Chat với chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
