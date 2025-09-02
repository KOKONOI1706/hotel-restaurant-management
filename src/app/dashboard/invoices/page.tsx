'use client';

import { useState, useEffect } from 'react';

interface Invoice {
  _id: string;
  invoiceNumber?: string;
  bookingId: {
    _id: string;
    roomNumber: string;
    representativeName: string;
    checkInDate: string;
    checkOutDate?: string;
    bookingType: 'individual' | 'company';
  };
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      const data = await response.json();
      
      if (data.success) {
        // Handle different response structures
        const invoicesData = data.data?.invoices || data.invoices || [];
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'partial':
        return 'Thanh toán 1 phần';
      case 'refunded':
        return 'Đã hoàn trả';
      default:
        return status;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
        if (response.ok) {
          fetchInvoices();
          alert('✅ Đã xóa hóa đơn thành công!');
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('❌ Lỗi khi xóa hóa đơn!');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Hóa đơn</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Tạo hóa đơn
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
            <p className="text-2xl font-bold text-gray-900">{Array.isArray(invoices) ? invoices.length : 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-blue-600">
              {((Array.isArray(invoices) ? invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) : 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Đã thu</p>
            <p className="text-2xl font-bold text-green-600">
              {((Array.isArray(invoices) ? invoices.reduce((sum, inv) => sum + inv.paidAmount, 0) : 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Còn nợ</p>
            <p className="text-2xl font-bold text-red-600">
              {((Array.isArray(invoices) ? invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0) : 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách hóa đơn</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : !Array.isArray(invoices) || invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy hóa đơn nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hóa đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã thu
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
                {Array.isArray(invoices) && invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{invoice.invoiceNumber || `INV-${invoice._id.slice(-6)}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.bookingId?.representativeName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.bookingId?.bookingType === 'company' ? '🏢 Công ty' : '👤 Cá nhân'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.bookingId?.roomNumber || 'N/A'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.paidAmount || 0)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(invoice.paymentStatus)}`}>
                        {getPaymentStatusLabel(invoice.paymentStatus)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert('Tính năng đang phát triển')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        
                        <button
                          onClick={() => alert('Tính năng đang phát triển')}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        
                        {invoice.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => alert('Tính năng đang phát triển')}
                            className="text-green-600 hover:text-green-900"
                            title="Thanh toán"
                          >
                            💳
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteInvoice(invoice._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
