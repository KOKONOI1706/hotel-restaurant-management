'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'cleaning';
  price: number;
  monthlyPrice?: number;
  description?: string;
  amenities?: string[];
  currentBooking?: {
    _id: string;
    bookingType: 'individual' | 'company';
    representativeName?: string;
    companyName?: string;
    representativePhone?: string;
    representativeEmail?: string;
    guests?: Array<{
      name: string;
      phone?: string;
      email?: string;
    }>;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    actualCheckIn?: string;
  };
}

interface RoomFormData {
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  price: number;
  monthlyPrice: number;
  description: string;
  amenities: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  });

  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: '',
    type: 'single',
    price: 0,
    monthlyPrice: 0,
    description: '',
    amenities: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();

      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        setError(data.error || 'Không thể tải danh sách phòng');
      }
    } catch (error) {
      setError('Lỗi mạng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAllRooms = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/rooms/sync-status', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh danh sách phòng sau khi sync
        await fetchRooms();
        
        if (data.updatedRooms && data.updatedRooms.length > 0) {
          alert(`Đã đồng bộ thành công ${data.updatedRooms.length} phòng!`);
        } else {
          alert('Tất cả phòng đã được đồng bộ đúng!');
        }
      } else {
        setError(data.error || 'Lỗi khi đồng bộ trạng thái phòng');
      }
    } catch (error) {
      setError('Lỗi mạng khi đồng bộ');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNewRoom = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      type: 'single',
      price: 0,
      monthlyPrice: 0,
      description: '',
      amenities: '',
    });
    setShowModal(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price,
      monthlyPrice: room.monthlyPrice || 0,
      description: room.description || '',
      amenities: room.amenities?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng này?')) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRooms();
      } else {
        alert('Không thể xóa phòng');
      }
    } catch (error) {
      alert('Lỗi khi xóa phòng');
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchRooms();
      } else {
        // Display specific error message from API
        alert(data.error || 'Không thể cập nhật trạng thái phòng');
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái phòng');
    }
  };

  const handleViewBookingInfo = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roomData = {
      ...formData,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
    };

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom._id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchRooms();
      } else {
        alert('Không thể lưu phòng');
      }
    } catch (error) {
      alert('Lỗi khi lưu phòng');
    }
  };

  const filteredRooms = rooms.filter(room => {
    return (
      (filters.status === '' || room.status === filters.status) &&
      (filters.type === '' || room.type === filters.type)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'cleaning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Có khách';
      case 'maintenance': return 'Bảo trì';
      case 'reserved': return 'Đã đặt';
      case 'cleaning': return 'Đang dọn dẹp';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'single': return 'Phòng đơn';
      case 'double': return 'Phòng đôi';
      case 'suite': return 'Phòng suite';
      case 'deluxe': return 'Phòng deluxe';
      default: return type;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Phòng</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncAllRooms}
            disabled={isSyncing}
            className="btn btn-secondary flex items-center"
          >
            {isSyncing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <ArrowPathIcon className="h-5 w-5 mr-2" />
            )}
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ trạng thái'}
          </button>
          <button
            onClick={handleNewRoom}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm Phòng Mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input w-48"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="available">Trống</option>
              <option value="occupied">Có khách</option>
              <option value="maintenance">Bảo trì</option>
              <option value="reserved">Đã đặt</option>
              <option value="cleaning">Đang dọn dẹp</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input w-48"
            >
              <option value="">Tất cả loại phòng</option>
              <option value="single">Phòng đơn</option>
              <option value="double">Phòng đôi</option>
              <option value="suite">Phòng suite</option>
              <option value="deluxe">Phòng deluxe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <div key={room._id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Phòng {room.roomNumber}
              </h3>
              <div className="flex space-x-2">
                {(room.status === 'occupied' || room.status === 'reserved') && room.currentBooking && (
                  <button
                    onClick={() => handleViewBookingInfo(room)}
                    className="text-green-600 hover:text-green-900"
                    title="Xem thông tin khách"
                  >
                    👥
                  </button>
                )}
                <button
                  onClick={() => handleEditRoom(room)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(room._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Loại:</span>
                <span className="font-medium">{getTypeText(room.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giá ngày:</span>
                <span className="font-medium text-blue-600">{room.price.toLocaleString()} VND</span>
              </div>
              {room.monthlyPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá tháng:</span>
                  <span className="font-medium text-green-600">{room.monthlyPrice.toLocaleString()} VND</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                  {/* Only show status change buttons if room doesn't have active guests */}
                  {room.status === 'cleaning' && !room.currentBooking && (
                    <button
                      onClick={() => handleStatusChange(room._id, 'available')}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      title="Hoàn thành dọn dẹp"
                    >
                      ✓ Xong
                    </button>
                  )}
                  {/* Show disabled button with explanation when room has guests */}
                  {room.status === 'occupied' && room.currentBooking && (
                    <span 
                      className="px-2 py-1 bg-gray-300 text-gray-500 text-xs rounded cursor-not-allowed"
                      title="Không thể thay đổi trạng thái khi phòng đang có khách. Vui lòng thực hiện check-out trước."
                    >
                      🔒 Có khách
                    </span>
                  )}
                  {/* Allow cleaning transition only after checkout */}
                  {room.status === 'occupied' && !room.currentBooking && (
                    <button
                      onClick={() => handleStatusChange(room._id, 'cleaning')}
                      className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                      title="Chuyển sang dọn dẹp"
                    >
                      🧹 Dọn phòng
                    </button>
                  )}
                </div>
              </div>
              {room.description && (
                <div className="mt-3">
                  <span className="text-gray-600">Mô tả:</span>
                  <p className="text-sm text-gray-900 mt-1">{room.description}</p>
                </div>
              )}
              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600">Tiện ích:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy phòng nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingRoom ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số phòng
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại phòng
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="input mt-1"
                >
                  <option value="single">Phòng đơn</option>
                  <option value="double">Phòng đôi</option>
                  <option value="suite">Phòng suite</option>
                  <option value="deluxe">Phòng deluxe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá theo ngày (VND) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá theo tháng (VND)
                </label>
                <input
                  type="number"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                  className="input mt-1"
                  placeholder="Để trống sẽ tính tự động = giá ngày × 25"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Giá ưu đãi cho thuê dài hạn. Nếu để trống, hệ thống sẽ tính: {formData.price ? (formData.price * 25).toLocaleString() : '0'} VND
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tiện ích (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="input mt-1"
                  placeholder="WiFi, TV, Điều hòa"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingRoom ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thông tin booking */}
      {showBookingModal && selectedRoom?.currentBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Thông tin khách - Phòng {selectedRoom.roomNumber}
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Thông tin cơ bản */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Thông tin booking</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Loại booking:</span>
                    <span className="ml-2 font-medium">
                      {selectedRoom.currentBooking.bookingType === 'individual' ? 'Cá nhân' : 'Công ty'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedRoom.currentBooking.status === 'checked-in' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedRoom.currentBooking.status === 'checked-in' ? 'Đã check-in' : 'Đã xác nhận'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Check-in:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedRoom.currentBooking.checkInDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Check-out:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedRoom.currentBooking.checkOutDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {selectedRoom.currentBooking.actualCheckIn && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Thời gian check-in thực tế:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedRoom.currentBooking.actualCheckIn).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">
                  {selectedRoom.currentBooking.bookingType === 'individual' ? 'Thông tin người đại diện' : 'Thông tin công ty'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedRoom.currentBooking.bookingType === 'individual' ? (
                    <div>
                      <span className="text-gray-600">Tên:</span>
                      <span className="ml-2 font-medium">{selectedRoom.currentBooking.representativeName || 'Chưa cập nhật'}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-600">Tên công ty:</span>
                      <span className="ml-2 font-medium">{selectedRoom.currentBooking.companyName || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>
                    <span className="ml-2 font-medium">{selectedRoom.currentBooking.representativePhone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedRoom.currentBooking.representativeEmail || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>

              {/* Danh sách khách */}
              {selectedRoom.currentBooking.guests && selectedRoom.currentBooking.guests.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-700">Danh sách khách ({selectedRoom.currentBooking.guests.length} người)</h4>
                  <div className="space-y-2">
                    {selectedRoom.currentBooking.guests.map((guest, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Tên:</span>
                            <span className="ml-2 font-medium">{guest.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Điện thoại:</span>
                            <span className="ml-2">{guest.phone || 'Chưa có'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2">{guest.email || 'Chưa có'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="btn btn-secondary"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
