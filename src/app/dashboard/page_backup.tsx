'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  reservedRooms: number;
  cleaningRooms: number;
  totalBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

interface RoomStatusData {
  name: string;
  value: number;
  color: string;
}

interface RecentBooking {
  _id: string;
  guestName: string;
  roomInfo: {
    roomNumber: string;
    type: string;
  } | null;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface OccupiedRoom {
  _id: string;
  roomNumber: string;
  type: string;
  status: string;
  booking: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
  } | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [roomStatusData, setRoomStatusData] = useState<RoomStatusData[]>([]);
  const [occupiedRooms, setOccupiedRooms] = useState<OccupiedRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setRecentBookings(data.data.recentBookings);
        setRoomStatusData(data.data.roomStatusData);
        setOccupiedRooms(data.data.occupiedRooms);
      } else {
        setError(data.error || 'Không thể tải dữ liệu dashboard');
      }
    } catch (error) {
      setError('Lỗi mạng');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      name: 'Tổng số phòng',
      value: stats?.totalRooms || 0,
      icon: BuildingStorefrontIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Phòng trống',
      value: stats?.availableRooms || 0,
      icon: BuildingStorefrontIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Phòng có khách',
      value: stats?.occupiedRooms || 0,
      icon: UserGroupIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Check-in hôm nay',
      value: stats?.todayCheckIns || 0,
      icon: CalendarDaysIcon,
      color: 'bg-purple-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800' },
      'checked-in': { label: 'Đã check-in', class: 'bg-green-100 text-green-800' },
      'checked-out': { label: 'Đã check-out', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển</h1>
        <div className="text-sm text-gray-500">
          Chào mừng trở lại! Đây là tổng quan khách sạn của bạn.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh Thu</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Tháng này</p>
              <p className="text-2xl font-bold text-green-600">
                {(stats?.monthlyRevenue || 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Năm này</p>
              <p className="text-xl font-semibold text-blue-600">
                {(stats?.yearlyRevenue || 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </div>

        {/* Room Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng Thái Phòng</h3>
          {roomStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Recent Bookings & Occupied Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Đặt Phòng Gần Đây</h3>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guestName}</p>
                      <p className="text-sm text-gray-600">
                        {booking.roomInfo ? `Phòng ${booking.roomInfo.roomNumber} - ${booking.roomInfo.type}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {booking.totalAmount.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có đặt phòng gần đây</p>
          )}
        </div>

        {/* Occupied Rooms */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phòng Đang Có Khách</h3>
          {occupiedRooms.length > 0 ? (
            <div className="space-y-4">
              {occupiedRooms.map((room) => (
                <div key={room._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Phòng {room.roomNumber}</p>
                      <p className="text-sm text-gray-600">{room.type}</p>
                      {room.booking && (
                        <>
                          <p className="text-sm text-blue-600">{room.booking.guestName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(room.booking.checkInDate)} → {formatDate(room.booking.checkOutDate)}
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.status === 'occupied' ? 'bg-red-100 text-red-800' : 
                        room.status === 'reserved' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {room.status === 'occupied' ? 'Có khách' : 
                         room.status === 'reserved' ? 'Đã đặt' : room.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có phòng nào đang có khách</p>
          )}
        </div>
      </div>
    </div>
  );
}
