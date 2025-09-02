'use client';

import { useState } from 'react';

export default function AddRoomsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addNewRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/add-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const resetAndAddRooms = async () => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn XÓA TẤT CẢ phòng hiện có và tạo lại 15 phòng mới?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/add-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetAll: true }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const viewAllRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🏨 Thêm Phòng Mới Vào Hệ Thống
          </h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Tầng 1 */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">🏢 Tầng 1 (4 phòng)</h3>
              <ul className="text-purple-800 space-y-2">
                <li>• <strong>Phòng 101</strong> - Single (80k VND)</li>
                <li>• <strong>Phòng 102</strong> - Double (120k VND)</li>
                <li>• <strong>Phòng 103</strong> - Double (120k VND)</li>
                <li>• <strong>Phòng 104</strong> - Suite (200k VND)</li>
              </ul>
              <p className="text-sm text-purple-600 mt-4">
                Tầng tiêu chuẩn với suite cao cấp
              </p>
            </div>

            {/* Tầng 2 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">🏢 Tầng 2 (7 phòng)</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• <strong>Phòng 201, 206, 207</strong> - Single (100k VND)</li>
                <li>• <strong>Phòng 202-205</strong> - Double (150k VND)</li>
              </ul>
              <p className="text-sm text-blue-600 mt-4">
                Tầng deluxe với ban công<br/>
                Tiện ích: WiFi, TV, Điều hòa, Mini Bar
              </p>
            </div>

            {/* Tầng 3 */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">🏢 Tầng 3 VIP (4 phòng)</h3>
              <ul className="text-green-800 space-y-2">
                <li>• <strong>Phòng 301, 302</strong> - VIP Suite (250k VND)</li>
                <li>• <strong>Phòng 303, 304</strong> - Double VIP (180k VND)</li>
              </ul>
              <p className="text-sm text-green-600 mt-4">
                Tầng VIP với view đẹp, jacuzzi<br/>
                Dịch vụ phòng 24/7
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-center space-x-4">
              <button
                onClick={addNewRooms}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {loading ? '⏳ Đang thêm...' : '➕ Thêm Phòng Mới (Bỏ qua đã có)'}
              </button>
              
              <button
                onClick={resetAndAddRooms}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {loading ? '⏳ Đang reset...' : '🔄 Reset & Tạo Lại Tất Cả'}
              </button>
              
              <button
                onClick={viewAllRooms}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {loading ? '⏳ Đang tải...' : '👁️ Xem Tất Cả Phòng'}
              </button>
            </div>

            {result && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết quả:</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">📋 Hướng dẫn:</h3>
              <ul className="text-yellow-800 space-y-1">
                <li>• <strong>Thêm Phòng Mới:</strong> Chỉ thêm phòng chưa tồn tại (15 phòng)</li>
                <li>• <strong>Reset & Tạo Lại:</strong> Xóa TẤT CẢ phòng cũ và tạo 15 phòng mới</li>
                <li>• <strong>Xem Tất Cả Phòng:</strong> Hiển thị danh sách tất cả phòng</li>
                <li>• Hệ thống sẽ tự động bỏ qua phòng đã tồn tại (trừ khi reset)</li>
                <li>• <strong>Tổng:</strong> 5 Single, 7 Double, 3 Suite</li>
              </ul>
              
              <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
                <p className="text-red-800 text-sm">
                  ⚠️ <strong>Chú ý:</strong> Nút "Reset & Tạo Lại" sẽ XÓA TẤT CẢ phòng hiện có! 
                  Chỉ sử dụng khi cần khởi tạo lại toàn bộ dữ liệu phòng.
                </p>
              </div>
            </div>

            <div className="text-center space-x-4">
              <a
                href="/"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                🏠 Về Trang Chủ
              </a>
              
              <a
                href="/dashboard/rooms"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                🏨 Quản Lý Phòng
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
