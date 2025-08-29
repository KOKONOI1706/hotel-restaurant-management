'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              <span className="text-blue-600 font-medium">Liên hệ</span>
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
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn để mang đến trải nghiệm tuyệt vời nhất
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Gửi tin nhắn</h2>
            </div>

            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cảm ơn bạn đã liên hệ!
                </h3>
                <p className="text-gray-600">
                  Chúng tôi sẽ phản hồi trong vòng 24 giờ tới.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123 456 789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ đề *
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="booking">Đặt phòng</option>
                      <option value="service">Dịch vụ</option>
                      <option value="complaint">Khiếu nại</option>
                      <option value="suggestion">Góp ý</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Điện thoại</h3>
                    <a href="tel:+84399135959" className="text-blue-600 hover:underline">
                      0399 13 5959
                    </a>
                    <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <EnvelopeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a href="mailto:suoimo4512@gmail.com" className="text-green-600 hover:underline">
                      suoimo4512@gmail.com
                    </a>
                    <p className="text-sm text-gray-500">Phản hồi trong 24h</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <MapPinIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Địa chỉ</h3>
                    <p className="text-gray-700">Suối Mơ, Khánh An</p>
                    <p className="text-gray-700">U Minh, Cà Mau</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <ClockIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Giờ làm việc</h3>
                    <p className="text-gray-700">Thứ 2 - Chủ nhật</p>
                    <p className="text-gray-700">24/7 - Luôn sẵn sàng phục vụ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                Kết nối với chúng tôi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="#"
                  className="flex items-center justify-center bg-blue-50 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center bg-pink-50 text-pink-600 py-3 px-4 rounded-lg hover:bg-pink-100 transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center bg-red-50 text-red-600 py-3 px-4 rounded-lg hover:bg-red-100 transition-colors"
                >
                  YouTube
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center bg-green-50 text-green-600 py-3 px-4 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vị trí của chúng tôi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Suối Mơ Resort tọa lạc tại vị trí đắc địa, dễ dàng di chuyển và khám phá các điểm du lịch nổi tiếng
            </p>
          </div>

          <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Google Maps Integration</p>
              <p className="text-sm text-gray-500">Suối Mơ, Khánh An, U Minh, Cà Mau</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-gray-600">
              Những câu hỏi phổ biến từ khách hàng
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Làm thế nào để đặt phòng?
              </h3>
              <p className="text-gray-600">
                Bạn có thể đặt phòng trực tuyến qua website, gọi hotline 0399 13 5959 hoặc email suoimo4512@gmail.com
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Chính sách hủy phòng như thế nào?
              </h3>
              <p className="text-gray-600">
                Bạn có thể hủy phòng miễn phí trước 24 giờ so với thời gian check-in. Sau đó sẽ tính phí theo quy định.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Resort có những dịch vụ gì?
              </h3>
              <p className="text-gray-600">
                Chúng tôi có spa, massage, nhà hàng, tour du lịch, thể thao dưới nước và nhiều dịch vụ giải trí khác.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Có wifi miễn phí không?
              </h3>
              <p className="text-gray-600">
                Có, toàn bộ khu vực resort đều có wifi miễn phí tốc độ cao cho khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
