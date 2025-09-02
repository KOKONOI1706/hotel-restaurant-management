'use client';

import { useState, useEffect } from 'react';

interface Guest {
  _id?: string;
  fullName: string;
  idNumber: string;
  idType: 'cccd' | 'cmnd' | 'passport';
  phone: string;
  purpose: 'tourism' | 'business' | 'education' | 'medical' | 'other';
  otherPurpose?: string;
  checkInDate: string;
  checkOutDate?: string;
  currentRoom?: string;
  roomHistory: RoomStay[];
  status: 'active' | 'checked_out';
  notes?: string;
}

interface RoomStay {
  roomNumber: string;
  checkInDate: string;
  checkOutDate?: string;
  reason?: string; // Lý do chuyển phòng
}

export default function GuestManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'checked_out'>('all');

  // Load data from localStorage
  useEffect(() => {
    loadGuestsFromStorage();
  }, []);

  const loadGuestsFromStorage = () => {
    try {
      const saved = localStorage.getItem('hotel_guests');
      if (saved) {
        setGuests(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGuestsToStorage = (guestList: Guest[]) => {
    try {
      localStorage.setItem('hotel_guests', JSON.stringify(guestList));
      setGuests(guestList);
    } catch (error) {
      console.error('Error saving guests:', error);
    }
  };

  const addNewGuest = (guestData: Omit<Guest, '_id' | 'roomHistory' | 'status'>) => {
    const newGuest: Guest = {
      ...guestData,
      _id: Date.now().toString(),
      roomHistory: guestData.currentRoom ? [{
        roomNumber: guestData.currentRoom,
        checkInDate: guestData.checkInDate
      }] : [],
      status: 'active'
    };
    
    const updatedGuests = [...guests, newGuest];
    saveGuestsToStorage(updatedGuests);
    setShowAddForm(false);
  };

  const updateGuest = (guestId: string, updatedData: Partial<Guest>) => {
    const updatedGuests = guests.map(guest => 
      guest._id === guestId ? { ...guest, ...updatedData } : guest
    );
    saveGuestsToStorage(updatedGuests);
    setShowEditForm(false);
    setSelectedGuest(null);
    alert('✅ Đã cập nhật thông tin khách thuê thành công!');
  };

  const transferRoom = (guestId: string, newRoom: string, reason?: string) => {
    const updatedGuests = guests.map(guest => {
      if (guest._id === guestId) {
        // Đóng phòng hiện tại
        const updatedRoomHistory = guest.roomHistory.map(stay => 
          !stay.checkOutDate ? { ...stay, checkOutDate: new Date().toISOString() } : stay
        );

        // Thêm phòng mới
        updatedRoomHistory.push({
          roomNumber: newRoom,
          checkInDate: new Date().toISOString(),
          reason
        });

        return {
          ...guest,
          currentRoom: newRoom,
          roomHistory: updatedRoomHistory
        };
      }
      return guest;
    });

    saveGuestsToStorage(updatedGuests);
    setShowTransferForm(false);
    setSelectedGuest(null);
  };

  const checkOutGuest = (guestId: string) => {
    if (confirm('Xác nhận check-out khách này?')) {
      const updatedGuests = guests.map(guest => {
        if (guest._id === guestId) {
          // Đóng phòng hiện tại
          const updatedRoomHistory = guest.roomHistory.map(stay => 
            !stay.checkOutDate ? { ...stay, checkOutDate: new Date().toISOString() } : stay
          );

          return {
            ...guest,
            status: 'checked_out' as const,
            checkOutDate: new Date().toISOString(),
            currentRoom: undefined,
            roomHistory: updatedRoomHistory
          };
        }
        return guest;
      });

      saveGuestsToStorage(updatedGuests);
    }
  };

  const filteredGuests = guests.filter(guest => {
    if (filter === 'all') return true;
    return guest.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPurposeLabel = (purpose: string, otherPurpose?: string) => {
    switch (purpose) {
      case 'tourism': return 'Du lịch';
      case 'business': return 'Công tác';
      case 'education': return 'Học tập';
      case 'medical': return 'Khám chữa bệnh';
      case 'other': return otherPurpose || 'Khác';
      default: return purpose;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          👥 Quản lý khách thuê
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
          >
            ➕ Thêm khách mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả ({guests.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm ${
            filter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Đang thuê ({guests.filter(g => g.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('checked_out')}
          className={`px-4 py-2 rounded-lg text-sm ${
            filter === 'checked_out' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Đã check-out ({guests.filter(g => g.status === 'checked_out').length})
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng khách</p>
            <p className="text-2xl font-bold text-gray-900">{guests.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Đang thuê</p>
            <p className="text-2xl font-bold text-green-600">{guests.filter(g => g.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Đã check-out</p>
            <p className="text-2xl font-bold text-gray-600">{guests.filter(g => g.status === 'checked_out').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Số phòng đang sử dụng</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Set(guests.filter(g => g.status === 'active' && g.currentRoom).map(g => g.currentRoom)).size}
            </p>
          </div>
        </div>
      </div>

      {filteredGuests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Chưa có khách thuê nào' : 
             filter === 'active' ? 'Không có khách đang thuê' :
             'Không có khách đã check-out'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' && 'Nhấn "Thêm khách mới" để bắt đầu quản lý khách thuê.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách thuê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CCCD/CMND
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng hiện tại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mục đích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {guest.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {guest.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-mono">{guest.idNumber}</div>
                      <div className="text-xs text-gray-500">{guest.idType.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.currentRoom ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Phòng {guest.currentRoom}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {guest.roomHistory.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ({guest.roomHistory.length} lần chuyển phòng)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPurposeLabel(guest.purpose, guest.otherPurpose)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(guest.checkInDate)}
                      {guest.checkOutDate && (
                        <div className="text-xs">
                          Check-out: {formatDate(guest.checkOutDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        guest.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {guest.status === 'active' ? '🟢 Đang thuê' : '⚪ Đã check-out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedGuest(guest)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded text-xs"
                      >
                        👁️ Chi tiết
                      </button>
                      {guest.status === 'active' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedGuest(guest);
                              setShowTransferForm(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 bg-orange-50 px-2 py-1 rounded text-xs"
                          >
                            🔄 Chuyển phòng
                          </button>
                          <button
                            onClick={() => checkOutGuest(guest._id!)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded text-xs"
                          >
                            🚪 Check-out
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Detail Modal */}
      {selectedGuest && !showTransferForm && !showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                👤 Chi tiết khách thuê: {selectedGuest.fullName}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Thông tin cá nhân</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="ml-2 font-medium">{selectedGuest.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CCCD/CMND:</span>
                      <span className="ml-2 font-mono">{selectedGuest.idNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loại giấy tờ:</span>
                      <span className="ml-2">{selectedGuest.idType.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Điện thoại:</span>
                      <span className="ml-2">{selectedGuest.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mục đích:</span>
                      <span className="ml-2">{getPurposeLabel(selectedGuest.purpose, selectedGuest.otherPurpose)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Thông tin lưu trú</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Check-in:</span>
                      <span className="ml-2">{formatDate(selectedGuest.checkInDate)}</span>
                    </div>
                    {selectedGuest.checkOutDate && (
                      <div>
                        <span className="text-gray-600">Check-out:</span>
                        <span className="ml-2">{formatDate(selectedGuest.checkOutDate)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Phòng hiện tại:</span>
                      <span className="ml-2">{selectedGuest.currentRoom || 'Không có'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedGuest.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedGuest.status === 'active' ? 'Đang thuê' : 'Đã check-out'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedGuest.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Ghi chú</h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedGuest.notes}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  Lịch sử chuyển phòng ({selectedGuest.roomHistory.length} lần)
                </h3>
                <div className="space-y-3">
                  {selectedGuest.roomHistory.map((stay, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Phòng:</span>
                          <span className="ml-2 font-medium">Phòng {stay.roomNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-in:</span>
                          <span className="ml-2">{formatDate(stay.checkInDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-out:</span>
                          <span className="ml-2">{stay.checkOutDate ? formatDate(stay.checkOutDate) : 'Hiện tại'}</span>
                        </div>
                        {stay.reason && (
                          <div className="col-span-3">
                            <span className="text-gray-600">Lý do chuyển:</span>
                            <span className="ml-2">{stay.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowEditForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                ✏️ Chỉnh sửa
              </button>
              {selectedGuest.status === 'active' && (
                <button
                  onClick={() => setShowTransferForm(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  🔄 Chuyển phòng
                </button>
              )}
              <button
                onClick={() => setSelectedGuest(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Form Modal */}
      {showAddForm && <AddGuestForm onSubmit={addNewGuest} onClose={() => setShowAddForm(false)} />}

      {/* Edit Guest Form Modal */}
      {showEditForm && selectedGuest && (
        <EditGuestForm 
          guest={selectedGuest}
          onSubmit={(updatedData) => updateGuest(selectedGuest._id!, updatedData)}
          onClose={() => {
            setShowEditForm(false);
            setSelectedGuest(null);
          }}
        />
      )}

      {/* Transfer Room Form Modal */}
      {showTransferForm && selectedGuest && (
        <TransferRoomForm 
          guest={selectedGuest}
          onSubmit={(newRoom, reason) => transferRoom(selectedGuest._id!, newRoom, reason)}
          onClose={() => {
            setShowTransferForm(false);
            setSelectedGuest(null);
          }}
        />
      )}
    </div>
  );
}

// Add Guest Form Component
function AddGuestForm({ onSubmit, onClose }: {
  onSubmit: (guest: Omit<Guest, '_id' | 'roomHistory' | 'status'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    idType: 'cccd' as 'cccd' | 'cmnd' | 'passport',
    phone: '',
    purpose: 'tourism' as 'tourism' | 'business' | 'education' | 'medical' | 'other',
    otherPurpose: '',
    currentRoom: '',
    checkInDate: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idNumber || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">➕ Thêm khách thuê mới</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ tên *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Loại giấy tờ</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({...formData, idType: e.target.value as any})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cccd">CCCD</option>
                <option value="cmnd">CMND</option>
                <option value="passport">Hộ chiếu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Số CCCD/CMND *</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mục đích lưu trú</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value as any})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tourism">Du lịch</option>
                <option value="business">Công tác</option>
                <option value="education">Học tập</option>
                <option value="medical">Khám chữa bệnh</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            {formData.purpose === 'other' && (
              <div>
                <label className="block text-sm font-medium mb-1">Mục đích khác</label>
                <input
                  type="text"
                  value={formData.otherPurpose}
                  onChange={(e) => setFormData({...formData, otherPurpose: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Phòng</label>
              <input
                type="text"
                value={formData.currentRoom}
                onChange={(e) => setFormData({...formData, currentRoom: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 101"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian check-in</label>
              <input
                type="datetime-local"
                value={formData.checkInDate}
                onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </form>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Thêm khách
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Guest Form Component
function EditGuestForm({ guest, onSubmit, onClose }: {
  guest: Guest;
  onSubmit: (updatedData: Partial<Guest>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: guest.fullName,
    idNumber: guest.idNumber,
    idType: guest.idType,
    phone: guest.phone,
    purpose: guest.purpose,
    otherPurpose: guest.otherPurpose || '',
    notes: guest.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idNumber || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">✏️ Chỉnh sửa thông tin khách thuê</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ tên *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Loại giấy tờ</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({...formData, idType: e.target.value as any})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cccd">CCCD</option>
                <option value="cmnd">CMND</option>
                <option value="passport">Hộ chiếu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Số CCCD/CMND *</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mục đích lưu trú</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value as any})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tourism">Du lịch</option>
                <option value="business">Công tác</option>
                <option value="education">Học tập</option>
                <option value="medical">Khám chữa bệnh</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            {formData.purpose === 'other' && (
              <div>
                <label className="block text-sm font-medium mb-1">Mục đích khác</label>
                <input
                  type="text"
                  value={formData.otherPurpose}
                  onChange={(e) => setFormData({...formData, otherPurpose: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Lưu ý:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Thông tin check-in/check-out và lịch sử chuyển phòng không thể chỉnh sửa</li>
              <li>• Để thay đổi phòng, vui lòng sử dụng chức năng "Chuyển phòng"</li>
            </ul>
          </div>
        </form>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

// Transfer Room Form Component
function TransferRoomForm({ guest, onSubmit, onClose }: {
  guest: Guest;
  onSubmit: (newRoom: string, reason?: string) => void;
  onClose: () => void;
}) {
  const [newRoom, setNewRoom] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom) {
      alert('Vui lòng nhập số phòng mới!');
      return;
    }

    if (newRoom === guest.currentRoom) {
      alert('Phòng mới phải khác phòng hiện tại!');
      return;
    }

    onSubmit(newRoom, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">🔄 Chuyển phòng cho {guest.fullName}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phòng hiện tại</label>
            <input
              type="text"
              value={guest.currentRoom || ''}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phòng mới *</label>
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: 102"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Lý do chuyển phòng</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ví dụ: Khách yêu cầu phòng lớn hơn..."
            />
          </div>
        </form>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Chuyển phòng
          </button>
        </div>
      </div>
    </div>
  );
}
