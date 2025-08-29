'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  SparklesIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  duration?: number;
  availability: boolean;
  images?: string[];
  features?: string[];
  rating?: number;
  reviewCount?: number;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          // Add mock data for better customer experience
          const serviceWithMockData = {
            ...data.service,
            images: getDefaultServiceImages(data.service.category),
            rating: getDefaultRating(data.service.category),
            reviewCount: getDefaultReviewCount(data.service.category),
            features: getDefaultFeatures(data.service.category)
          };
          setService(serviceWithMockData);
        } else {
          setError('Không thể tải thông tin dịch vụ');
        }
      } catch (error) {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const getDefaultServiceImages = (category: string) => {
    const imageMap: { [key: string]: string[] } = {
      spa: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552084117-56a987666449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      restaurant: [
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      tour: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      default: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    };
    return imageMap[category] || imageMap.default;
  };

  const getDefaultRating = (category: string) => {
    const ratingMap: { [key: string]: number } = {
      spa: 4.8,
      restaurant: 4.6,
      tour: 4.7,
      default: 4.5
    };
    return ratingMap[category] || ratingMap.default;
  };

  const getDefaultReviewCount = (category: string) => {
    const reviewMap: { [key: string]: number } = {
      spa: 156,
      restaurant: 234,
      tour: 89,
      default: 67
    };
    return reviewMap[category] || reviewMap.default;
  };

  const getDefaultFeatures = (category: string) => {
    const featureMap: { [key: string]: string[] } = {
      spa: ['Massage toàn thân', 'Sauna', 'Jacuzzi', 'Aromatherapy'],
      restaurant: ['Buffet cao cấp', 'Món Á - Âu', 'View biển', 'Phục vụ 24/7'],
      tour: ['Hướng dẫn viên', 'Đưa đón', 'Ăn trưa', 'Bảo hiểm'],
      default: ['Chất lượng cao', 'Phục vụ chuyên nghiệp', 'Giá cả hợp lý']
    };
    return featureMap[category] || featureMap.default;
  };

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

  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      spa: 'Spa & Massage',
      restaurant: 'Nhà hàng',
      tour: 'Tour du lịch',
      default: 'Dịch vụ khác'
    };
    return categoryMap[category] || categoryMap.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy dịch vụ</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/customer/services"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

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
              <Link href="/customer/services" className="text-blue-600 font-medium">
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

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/customer" className="text-gray-500 hover:text-gray-700">
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/customer/services" className="text-gray-500 hover:text-gray-700">
              Dịch vụ
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{service.name}</span>
          </div>
        </div>
      </div>

      {/* Service Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                src={service.images?.[0]}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>
            {service.images && service.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {service.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${service.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getCategoryName(service.category)}
                </span>
                <div className="flex items-center space-x-1">
                  {renderStars(service.rating || 4.5)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({service.reviewCount || 67} đánh giá)
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
              <p className="text-gray-600 text-lg">{service.description}</p>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Giá dịch vụ</p>
                  <p className="font-semibold text-lg">
                    {service.price.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
              {service.duration && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-semibold">{service.duration} phút</p>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {service.features && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Đặc điểm nổi bật</h3>
                <div className="grid grid-cols-2 gap-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${service.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${service.availability ? 'text-green-700' : 'text-red-700'}`}>
                {service.availability ? 'Có sẵn' : 'Tạm hết'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link
                href="/customer/booking"
                className={`flex-1 text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  service.availability
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {service.availability ? 'Đặt dịch vụ' : 'Tạm hết'}
              </Link>
              <Link
                href="/customer/services"
                className="flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Cần tư vấn thêm?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Liên hệ với chúng tôi để được tư vấn chi tiết về dịch vụ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+84399135959"
              className="flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <PhoneIcon className="h-5 w-5 mr-2" />
              Hotline: 0399 13 5959
            </a>
            <a 
              href="mailto:suoimo4512@gmail.com"
              className="flex items-center justify-center border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Email: suoimo4512@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
