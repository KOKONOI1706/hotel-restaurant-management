'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  SparklesIcon, 
  StarIcon as StarSolid,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export default function CustomerHomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isClient, setIsClient] = useState(false);

  const heroImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ];

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch real reviews data when available
  useEffect(() => {
    // TODO: Replace with actual API call when reviews endpoint is implemented
    // For now, don't show mock reviews
    setReviews([]);
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    if (isClient) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isClient, heroImages.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarSolid
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return '0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Suối Mơ Resort</h1>
                <p className="text-sm text-gray-600">Thiên đường nghỉ dưỡng</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/customer" className="text-blue-600 font-semibold">
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

            {/* CTA Button */}
            <Link
              href="/customer/booking"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Đặt phòng ngay
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {isClient && (
          <div className="absolute inset-0">
            <img
              src={heroImages[currentImageIndex]}
              alt="Suối Mơ Resort"
              className="w-full h-full object-cover transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}
        
        {/* Navigation buttons */}
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-30 transition-all"
        >
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-30 transition-all"
        >
          <ChevronRightIcon className="h-6 w-6 text-white" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Chào mừng đến với Suối Mơ Resort
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Trải nghiệm nghỉ dưỡng đẳng cấp giữa thiên nhiên hùng vĩ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/customer/rooms"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Khám phá phòng
              </Link>
              <Link
                href="/customer/services"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Dịch vụ
              </Link>
            </div>
          </div>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Suối Mơ Resort?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm nghỉ dưỡng tuyệt vời với dịch vụ chất lượng cao
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl mb-6 group-hover:shadow-lg">
                <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Phòng đẳng cấp</h3>
              <p className="text-gray-600">
                Phòng nghỉ sang trọng với đầy đủ tiện nghi hiện đại và view tuyệt đẹp
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl mb-6 group-hover:shadow-lg">
                <GlobeAltIcon className="h-12 w-12 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dịch vụ hoàn hảo</h3>
              <p className="text-gray-600">
                Spa, massage, thể thao dưới nước và các hoạt động giải trí đa dạng
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl mb-6 group-hover:shadow-lg">
                <MapPinIcon className="h-12 w-12 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Vị trí tuyệt vời</h3>
              <p className="text-gray-600">
                Tọa lạc tại vị trí đắc địa, gần các điểm du lịch nổi tiếng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Phòng sang trọng</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-blue-100">Khách hàng hài lòng</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{calculateAverageRating()}</div>
              <div className="text-blue-100">Đánh giá trung bình</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {renderStars(Math.round(parseFloat(calculateAverageRating())))}
              <span className="text-2xl font-bold text-gray-900 ml-2">
                {calculateAverageRating()}
              </span>
              <span className="text-gray-600">({reviews.length} đánh giá)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{review.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{review.comment}</p>
                <p className="text-sm text-gray-500">{review.date}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/customer/reviews"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              Xem tất cả đánh giá
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sẵn sàng cho kỳ nghỉ tuyệt vời?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Đặt phòng ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng mới
          </p>
          <Link
            href="/customer/booking"
            className="bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <CalendarIcon className="h-6 w-6" />
            <span>Đặt phòng ngay</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Suối Mơ Resort</h3>
                  <p className="text-gray-400">Thiên đường nghỉ dưỡng</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Trải nghiệm kỳ nghỉ tuyệt vời tại Suối Mơ Resort - nơi hòa quyện giữa thiên nhiên và dịch vụ đẳng cấp.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2">
                <li><Link href="/customer/rooms" className="text-gray-400 hover:text-white transition-colors">Phòng nghỉ</Link></li>
                <li><Link href="/customer/services" className="text-gray-400 hover:text-white transition-colors">Dịch vụ</Link></li>
                <li><Link href="/customer/reviews" className="text-gray-400 hover:text-white transition-colors">Đánh giá</Link></li>
                <li><Link href="/customer/booking" className="text-gray-400 hover:text-white transition-colors">Đặt phòng</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">Suối Mơ, Khánh An, U Minh, Cà Mau</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">+84 123 456 789</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">suoimo4512@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 sm:mb-0">
              © 2025 Suối Mơ Resort. Tất cả quyền được bảo lưu.
            </p>
            <Link 
              href="/loginAdmin" 
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Quản trị viên →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
