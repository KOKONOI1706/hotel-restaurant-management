'use client';

export interface Guest {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  idType: 'cccd' | 'passport' | 'cmnd';
  nationality: string;
  address: string;
  phoneNumber: string;
  checkInDate: string;
  estimatedCheckOutDate: string;
  purpose: 'tourism' | 'business' | 'education' | 'medical' | 'other';
  otherPurpose: string;
}

export interface GuestRegistrationModalProps {
  isOpen: boolean;
  guests: Guest[];
  isSubmitting: boolean;
  onClose: () => void;
  onUpdateGuest: (index: number, updatedGuest: Partial<Guest>) => void;
  onAddGuest: () => void;
  onRemoveGuest: (index: number) => void;
  onSubmit: () => Promise<void>;
}

export default function GuestRegistrationModal({ 
  isOpen,
  guests = [],
  isSubmitting = false,
  onClose,
  onUpdateGuest,
  onAddGuest,
  onRemoveGuest,
  onSubmit
}: GuestRegistrationModalProps) {
  if (!isOpen) return null;

  const validateIDNumber = (idNumber: string, idType: string) => {
    if (idType === 'cccd') {
      return /^\d{12}$/.test(idNumber);
    } else if (idType === 'cmnd') {
      return /^\d{9}$/.test(idNumber) || /^\d{12}$/.test(idNumber);
    } else if (idType === 'passport') {
      return /^[A-Za-z0-9]{6,}$/.test(idNumber);
    }
    return true;
  };

  const handleSubmit = async () => {
    // Check if guests array exists and has items
    if (!guests || guests.length === 0) {
      alert('Vui lòng thêm ít nhất một khách lưu trú');
      return;
    }

    // Validate required fields
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      if (!guest.fullName.trim()) {
        alert(`Vui lòng nhập họ tên khách thứ ${i + 1}`);
        return;
      }
      if (!guest.idNumber.trim()) {
        alert(`Vui lòng nhập số CMND/CCCD/Passport cho khách thứ ${i + 1}`);
        return;
      }
      if (!validateIDNumber(guest.idNumber, guest.idType)) {
        alert(`Số ${guest.idType.toUpperCase()} không hợp lệ cho khách thứ ${i + 1}`);
        return;
      }
      if (!guest.dateOfBirth) {
        alert(`Vui lòng nhập ngày sinh cho khách thứ ${i + 1}`);
        return;
      }
      if (guest.purpose === 'other' && !guest.otherPurpose.trim()) {
        alert(`Vui lòng nhập mục đích cụ thể cho khách thứ ${i + 1}`);
        return;
      }
    }

    await onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-orange-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2">
                🏨 Đăng ký thông tin lưu trú
              </h2>
              <p className="text-sm text-orange-600 mt-1">
                Nhập thông tin khách để gửi thông báo lưu trú đến Cổng dịch vụ công
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {guests && guests.length > 0 ? guests.map((guest, index) => (
            <div key={index} className="mb-6 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">
                  👤 Khách lưu trú #{index + 1}
                </h3>
                {guests.length > 1 && (
                  <button
                    onClick={() => onRemoveGuest(index)}
                    className="text-red-500 hover:text-red-700 text-sm bg-red-50 px-2 py-1 rounded"
                    disabled={isSubmitting}
                  >
                    ✕ Xóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={guest.fullName}
                    onChange={(e) => onUpdateGuest(index, { fullName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Nguyễn Văn A"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    value={guest.dateOfBirth}
                    onChange={(e) => onUpdateGuest(index, { dateOfBirth: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giấy tờ *
                  </label>
                  <select
                    value={guest.idType}
                    onChange={(e) => onUpdateGuest(index, { idType: e.target.value as Guest['idType'] })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="cccd">Căn cước công dân (CCCD)</option>
                    <option value="cmnd">Chứng minh nhân dân (CMND)</option>
                    <option value="passport">Hộ chiếu (Passport)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số {guest.idType.toUpperCase()} *
                  </label>
                  <input
                    type="text"
                    value={guest.idNumber}
                    onChange={(e) => onUpdateGuest(index, { idNumber: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={guest.idType === 'cccd' ? '12 chữ số' : guest.idType === 'cmnd' ? '9 hoặc 12 chữ số' : 'Số hộ chiếu'}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quốc tịch
                  </label>
                  <input
                    type="text"
                    value={guest.nationality}
                    onChange={(e) => onUpdateGuest(index, { nationality: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Việt Nam"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={guest.phoneNumber}
                    onChange={(e) => onUpdateGuest(index, { phoneNumber: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="0123456789"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày check-in
                  </label>
                  <input
                    type="date"
                    value={guest.checkInDate}
                    onChange={(e) => onUpdateGuest(index, { checkInDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày check-out dự kiến
                  </label>
                  <input
                    type="date"
                    value={guest.estimatedCheckOutDate}
                    onChange={(e) => onUpdateGuest(index, { estimatedCheckOutDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ thường trú
                  </label>
                  <textarea
                    value={guest.address}
                    onChange={(e) => onUpdateGuest(index, { address: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mục đích lưu trú
                  </label>
                  <select
                    value={guest.purpose}
                    onChange={(e) => onUpdateGuest(index, { purpose: e.target.value as Guest['purpose'] })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="tourism">Du lịch</option>
                    <option value="business">Công tác</option>
                    <option value="education">Học tập</option>
                    <option value="medical">Khám chữa bệnh</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {guest.purpose === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mục đích cụ thể *
                    </label>
                    <input
                      type="text"
                      value={guest.otherPurpose}
                      onChange={(e) => onUpdateGuest(index, { otherPurpose: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập mục đích cụ thể"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              Không có thông tin khách lưu trú
            </div>
          )}

          {guests && guests.length > 0 && (
            <button
              onClick={onAddGuest}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              + Thêm khách lưu trú
            </button>
          )}

          {(!guests || guests.length === 0) && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-500 mb-4">Chưa có thông tin khách lưu trú</p>
              <button
                onClick={onAddGuest}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                + Thêm khách đầu tiên
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !guests || guests.length === 0}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  🚀 Gửi thông báo lưu trú
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
