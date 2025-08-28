'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  StarIcon,
  UserCircleIcon,
  CalendarIcon,
  FilmIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface Review {
  _id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  serviceId?: string;
  serviceName?: string;
  roomId?: string;
  roomNumber?: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  response?: {
    content: string;
    date: string;
    author: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterVerified, setFilterVerified] = useState(false);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          _id: '1',
          customerName: 'Nguyễn Thị Lan Anh',
          customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          rating: 5,
          comment: 'Trải nghiệm tuyệt vời tại Suối Mơ! Phòng rất sạch sẽ, view đẹp. Nhân viên phục vụ rất tận tình và chuyên nghiệp. Đặc biệt massage spa rất chất lượng, tôi cảm thấy thư giãn hoàn toàn. Chắc chắn sẽ quay lại!',
          date: '2025-01-15',
          serviceId: '1',
          serviceName: 'Massage Thư Giãn Toàn Thân',
          roomNumber: 'VIP-101',
          verified: true,
          helpful: 24,
          images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          response: {
            content: 'Cảm ơn chị Lan Anh đã chia sẻ trải nghiệm tuyệt vời! Chúng tôi rất vui khi biết chị đã có những giây phút thư giãn đáng nhớ tại Suối Mơ. Hy vọng được đón tiếp chị trong những chuyến nghỉ dưỡng tiếp theo.',
            date: '2025-01-16',
            author: 'Quản lý Suối Mơ Resort'
          }
        },
        {
          _id: '2',
          customerName: 'Trần Minh Đức',
          rating: 4,
          comment: 'Resort rất đẹp, không gian yên tĩnh phù hợp để nghỉ ngơi. Buffet sáng đa dạng và ngon. Chỉ có điều wifi hơi yếu ở một số khu vực. Nhưng nhìn chung rất hài lòng với kỳ nghỉ này.',
          date: '2025-01-12',
          roomNumber: 'DLX-205',
          verified: true,
          helpful: 18,
          response: {
            content: 'Cảm ơn anh Đức đã góp ý! Chúng tôi đã ghi nhận về vấn đề wifi và đang nâng cấp hệ thống để cải thiện chất lượng kết nối. Hy vọng anh sẽ có trải nghiệm hoàn hảo hơn trong lần ghé thăm tới.',
            date: '2025-01-13',
            author: 'Quản lý Suối Mơ Resort'
          }
        },
        {
          _id: '3',
          customerName: 'Lê Hoàng Phương',
          customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          rating: 5,
          comment: 'Kỳ nghỉ honey moon hoàn hảo! Set dinner lãng mạn với view núi tuyệt đẹp. Phòng được trang trí rất đặc biệt với hoa tươi và chocolate. Nhân viên rất chu đáo, luôn sẵn sàng hỗ trợ. 10/10 điểm!',
          date: '2025-01-10',
          serviceId: '4',
          serviceName: 'Set Menu Dinner Lãng Mạn',
          roomNumber: 'SUP-301',
          verified: true,
          helpful: 32,
          images: [
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]
        },
        {
          _id: '4',
          customerName: 'Phạm Văn Hùng',
          rating: 3,
          comment: 'Vị trí resort đẹp, view oke. Tuy nhiên phòng hơi cũ so với giá tiền. Dịch vụ đưa đón sân bay đúng giờ và lịch sự. Hy vọng resort sẽ cải thiện thêm về cơ sở vật chất.',
          date: '2025-01-08',
          serviceId: '6',
          serviceName: 'Dịch Vụ Đưa Đón Sân Bay',
          roomNumber: 'STD-102',
          verified: false,
          helpful: 8
        },
        {
          _id: '5',
          customerName: 'Đặng Thị Mai',
          customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          rating: 5,
          comment: 'Facial treatment tại spa rất chuyên nghiệp! Sản phẩm chất lượng cao, kỹ thuật viên có tay nghề. Da tôi sáng mịn hơn hẳn sau liệu trình. Không gian spa yên tĩnh, thư giãn. Sẽ book thêm lần nữa!',
          date: '2025-01-05',
          serviceId: '2',
          serviceName: 'Facial Chăm Sóc Da Cao Cấp',
          verified: true,
          helpful: 15
        },
        {
          _id: '6',
          customerName: 'Nguyễn Thanh Tuấn',
          rating: 4,
          comment: 'Cocktail bar có view đẹp, đồ uống ngon và bartender rất skilled. Giá hơi cao nhưng chất lượng xứng đáng. Không gian lãng mạn phù hợp cho date night.',
          date: '2025-01-03',
          serviceId: '5',
          serviceName: 'Cocktail Handcrafted',
          verified: true,
          helpful: 12
        },
        {
          _id: '7',
          customerName: 'Vũ Thị Hồng',
          rating: 2,
          comment: 'Phòng karaoke thiết bị hơi cũ, một số bài hát không có. Giá khá đắt so với chất lượng. Tuy nhiên nhân viên phục vụ tốt và đồ uống ổn.',
          date: '2025-01-01',
          serviceId: '8',
          serviceName: 'Phòng Karaoke VIP',
          verified: false,
          helpful: 5
        },
        {
          _id: '8',
          customerName: 'Lý Minh Châu',
          customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
          rating: 5,
          comment: 'Dịch vụ giặt ủi rất nhanh và chất lượng. Quần áo được là phẳng, thơm tho. Giá cả hợp lý. Rất tiện lợi cho khách lưu trú dài ngày.',
          date: '2024-12-28',
          serviceId: '7',
          serviceName: 'Giặt Ủi Express',
          verified: true,
          helpful: 9
        }
      ];

      const mockStats: ReviewStats = {
        totalReviews: 127,
        averageRating: 4.3,
        ratingDistribution: {
          5: 58,
          4: 31,
          3: 22,
          2: 11,
          1: 5
        }
      };

      setReviews(mockReviews);
      setReviewStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews
    .filter(review => !filterRating || review.rating === filterRating)
    .filter(review => !filterVerified || review.verified)
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'newest':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarSolid
        key={index}
        className={`${size} ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPercentage = (count: number, total: number) => {
    return Math.round((count / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/customer" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                <StarIcon className="h-8 w-8 text-white" />
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
              <span className="text-blue-600 font-medium">Đánh giá</span>
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
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Đánh giá khách hàng
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            Khám phá trải nghiệm thực tế từ những khách hàng đã lưu trú tại Suối Mơ Resort
          </p>
        </div>
      </section>

      {/* Review Stats */}
      {!loading && reviewStats && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Overall Rating */}
              <div className="text-center lg:text-left">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center lg:justify-start items-center mb-2">
                  {renderStars(Math.round(reviewStats.averageRating), 'h-6 w-6')}
                </div>
                <p className="text-gray-600 text-lg">
                  Dựa trên {reviewStats.totalReviews} đánh giá
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {Object.entries(reviewStats.ratingDistribution)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([rating, count]) => (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <StarSolid className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${getPercentage(count, reviewStats.totalReviews)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {getPercentage(count, reviewStats.totalReviews)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="bg-white shadow-sm border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={filterRating || ''}
                  onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Điểm cao nhất</option>
                  <option value="lowest">Điểm thấp nhất</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Verified Filter */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Chỉ đánh giá đã xác thực</span>
              </label>
            </div>

            <div className="text-sm text-gray-600">
              Hiển thị {filteredReviews.length} đánh giá
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đánh giá...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {review.customerAvatar ? (
                        <img
                          src={review.customerAvatar}
                          alt={review.customerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {review.customerName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              ✓ Đã xác thực
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service/Room Info */}
                  {(review.serviceName || review.roomNumber) && (
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      {review.serviceName && (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          🎯 {review.serviceName}
                        </span>
                      )}
                      {review.roomNumber && (
                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                          🏠 Phòng {review.roomNumber}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Review Content */}
                  <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {review.images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <span className="text-sm">Hữu ích ({review.helpful})</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span className="text-sm">Phản hồi</span>
                      </button>
                    </div>
                  </div>

                  {/* Management Response */}
                  {review.response && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">SM</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">{review.response.author}</p>
                          <p className="text-xs text-blue-700">{formatDate(review.response.date)}</p>
                        </div>
                      </div>
                      <p className="text-blue-800">{review.response.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có đánh giá nào</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc để xem thêm đánh giá</p>
            </div>
          )}
        </div>
      </section>

      {/* Write Review CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Chia sẻ trải nghiệm của bạn</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Đánh giá của bạn sẽ giúp chúng tôi cải thiện dịch vụ và hỗ trợ khách hàng khác đưa ra lựa chọn phù hợp
          </p>
          <Link 
            href="/customer/write-review"
            className="inline-flex items-center bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            <StarIcon className="h-5 w-5 mr-2" />
            Viết đánh giá
          </Link>
        </div>
      </section>
    </div>
  );
}
