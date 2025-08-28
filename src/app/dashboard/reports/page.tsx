'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentChartBarIcon,
  PrinterIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  revenue: {
    total: number;
    monthly: Array<{ month: string; amount: number; growth: number }>;
    daily: Array<{ date: string; amount: number }>;
    byCategory: Array<{ category: string; amount: number; percentage: number }>;
  };
  occupancy: {
    rate: number;
    totalRooms: number;
    occupiedRooms: number;
    avgRate: number;
    monthlyRates: Array<{ month: string; rate: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    byType: Array<{ type: string; count: number; percentage: number }>;
    satisfaction: number;
  };
  services: {
    totalOrders: number;
    revenue: number;
    popular: Array<{ name: string; orders: number; revenue: number }>;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockData: ReportData = {
        revenue: {
          total: 156800000,
          monthly: [
            { month: 'T1', amount: 12500000, growth: 5.2 },
            { month: 'T2', amount: 13200000, growth: 5.6 },
            { month: 'T3', amount: 14100000, growth: 6.8 },
            { month: 'T4', amount: 13800000, growth: -2.1 },
            { month: 'T5', amount: 15200000, growth: 10.1 },
            { month: 'T6', amount: 16500000, growth: 8.6 }
          ],
          daily: [
            { date: '2025-01-15', amount: 2500000 },
            { date: '2025-01-16', amount: 3200000 },
            { date: '2025-01-17', amount: 2800000 },
            { date: '2025-01-18', amount: 3500000 },
            { date: '2025-01-19', amount: 2900000 },
            { date: '2025-01-20', amount: 3100000 },
            { date: '2025-01-21', amount: 2700000 }
          ],
          byCategory: [
            { category: 'Phòng nghỉ', amount: 98500000, percentage: 62.8 },
            { category: 'Ăn uống', amount: 32400000, percentage: 20.7 },
            { category: 'Spa & Wellness', amount: 15600000, percentage: 9.9 },
            { category: 'Dịch vụ khác', amount: 10300000, percentage: 6.6 }
          ]
        },
        occupancy: {
          rate: 78.5,
          totalRooms: 50,
          occupiedRooms: 39,
          avgRate: 82.3,
          monthlyRates: [
            { month: 'T1', rate: 65.2 },
            { month: 'T2', rate: 72.1 },
            { month: 'T3', rate: 78.9 },
            { month: 'T4', rate: 75.4 },
            { month: 'T5', rate: 83.7 },
            { month: 'T6', rate: 88.2 }
          ]
        },
        customers: {
          total: 1247,
          new: 856,
          returning: 391,
          byType: [
            { type: 'Cá nhân', count: 892, percentage: 71.5 },
            { type: 'Công ty', count: 355, percentage: 28.5 }
          ],
          satisfaction: 4.6
        },
        services: {
          totalOrders: 2156,
          revenue: 58300000,
          popular: [
            { name: 'Massage thư giãn', orders: 456, revenue: 22800000 },
            { name: 'Ăn sáng buffet', orders: 892, revenue: 22300000 },
            { name: 'Đưa đón sân bay', orders: 234, revenue: 8190000 },
            { name: 'Giặt ủi', orders: 445, revenue: 2225000 },
            { name: 'Phòng họp', orders: 129, revenue: 2580000 }
          ]
        }
      };
      
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <PrinterIcon className="h-5 w-5" />
            In báo cáo
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2">
            <ArrowDownTrayIcon className="h-5 w-5" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại báo cáo</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Tổng quan</option>
              <option value="revenue">Doanh thu</option>
              <option value="occupancy">Tỷ lệ lấp đầy</option>
              <option value="customers">Khách hàng</option>
              <option value="services">Dịch vụ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Khoảng thời gian</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">So sánh với</label>
            <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="previous">Kỳ trước</option>
              <option value="same-last-year">Cùng kỳ năm trước</option>
              <option value="none">Không so sánh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {(reportData.revenue.total / 1000000).toFixed(1)}M
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(8.2)}
                <span className={`text-sm ml-1 ${getTrendColor(8.2)}`}>
                  +8.2% so với tháng trước
                </span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.occupancy.rate}%
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(5.1)}
                <span className={`text-sm ml-1 ${getTrendColor(5.1)}`}>
                  +5.1% so với tháng trước
                </span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng mới</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(reportData.customers.new)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(12.3)}
                <span className={`text-sm ml-1 ${getTrendColor(12.3)}`}>
                  +12.3% so với tháng trước
                </span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.customers.satisfaction.toFixed(1)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(0.3)}
                <span className={`text-sm ml-1 ${getTrendColor(0.3)}`}>
                  +0.3 so với tháng trước
                </span>
              </div>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Doanh thu theo tháng</h3>
            <DocumentChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {reportData.revenue.monthly.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium w-8">{month.month}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 ml-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(month.amount / 20000000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {(month.amount / 1000000).toFixed(1)}M
                  </span>
                  <div className="flex items-center">
                    {getTrendIcon(month.growth)}
                    <span className={`text-xs ${getTrendColor(month.growth)}`}>
                      {month.growth > 0 ? '+' : ''}{month.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tỷ lệ lấp đầy phòng</h3>
            <HomeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Phòng đang sử dụng</span>
              <span className="font-medium">{reportData.occupancy.occupiedRooms}/{reportData.occupancy.totalRooms}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full" 
                style={{ width: `${reportData.occupancy.rate}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">{reportData.occupancy.rate}%</span>
            </div>
            <div className="space-y-2">
              {reportData.occupancy.monthlyRates.map((month, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{month.month}</span>
                  <span className="font-medium">{month.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Doanh thu theo danh mục</h3>
          <div className="space-y-4">
            {reportData.revenue.byCategory.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Dịch vụ phổ biến</h3>
          <div className="space-y-3">
            {reportData.services.popular.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-gray-600">{service.orders} lượt đặt</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {formatCurrency(service.revenue)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {((service.revenue / reportData.services.revenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Thống kê khách hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Phân loại khách hàng</h4>
            {reportData.customers.byType.map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{type.type}</span>
                  <span className="text-sm font-medium">{type.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatNumber(type.count)} khách hàng
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Khách hàng mới vs Quay lại</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Khách hàng mới</span>
                <span className="font-medium">{formatNumber(reportData.customers.new)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Khách hàng quay lại</span>
                <span className="font-medium">{formatNumber(reportData.customers.returning)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Tổng cộng</span>
                <span>{formatNumber(reportData.customers.total)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Đánh giá khách hàng</h4>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500">
                {reportData.customers.satisfaction.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Trên thang điểm 5
              </div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-xl ${
                      i < Math.floor(reportData.customers.satisfaction) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
