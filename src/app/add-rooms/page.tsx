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
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Phòng đơn */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">🛏️ Phòng Đơn</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• <strong>Phòng 201</strong> - Standard, 1 người</li>
                <li>• <strong>Phòng 206</strong> - Standard, 1 người</li>
                <li>• <strong>Phòng 207</strong> - Standard, 1 người</li>
              </ul>
              <p className="text-sm text-blue-600 mt-4">
                Giá: 100,000 VND/đêm<br/>
                Tiện ích: WiFi, TV, Điều hòa
              </p>
            </div>

            {/* Phòng đôi */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">🛏️🛏️ Phòng Đôi</h3>
              <ul className="text-green-800 space-y-2">
                <li>• <strong>Phòng 202</strong> - Deluxe, 2 người</li>
                <li>• <strong>Phòng 203</strong> - Deluxe, 2 người</li>
                <li>• <strong>Phòng 204</strong> - Deluxe, 2 người</li>
                <li>• <strong>Phòng 205</strong> - Deluxe, 2 người</li>
              </ul>
              <p className="text-sm text-green-600 mt-4">
                Giá: 150,000 VND/đêm<br/>
                Tiện ích: WiFi, TV, Điều hòa, Mini Bar, Ban công
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
                {loading ? '⏳ Đang thêm...' : '➕ Thêm Tất Cả Phòng'}
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
                <li>• <strong>Thêm Tất Cả Phòng:</strong> Thêm 7 phòng mới vào database</li>
                <li>• <strong>Xem Tất Cả Phòng:</strong> Hiển thị danh sách tất cả phòng</li>
                <li>• Hệ thống sẽ tự động bỏ qua phòng đã tồn tại</li>
                <li>• Tất cả phòng mới đều ở trạng thái "available"</li>
              </ul>
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
