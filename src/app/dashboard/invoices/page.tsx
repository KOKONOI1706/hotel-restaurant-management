'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

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
  roomCharges: number;
  serviceCharges: number;
  taxes: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'online';
  paymentDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdAt: string;
  paymentHistory?: PaymentRecord[];
}

interface PaymentRecord {
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'online';
  date: string;
  note?: string;
}

interface Filters {
  search: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  roomNumber: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
    roomNumber: ''
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      const data = await response.json();
      
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // CRUD Functions
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

  const processPayment = async (invoiceId: string, amount: number, method: string, note?: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, note })
      });
      
      if (response.ok) {
        fetchInvoices();
        setShowPaymentForm(false);
        setSelectedInvoice(null);
        alert('✅ Thanh toán thành công!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Lỗi khi xử lý thanh toán!');
    }
  };

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

  // Filter functions
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !filters.search || 
      invoice.invoiceNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.bookingId.representativeName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || invoice.status === filters.status;
    const matchesPaymentStatus = !filters.paymentStatus || invoice.paymentStatus === filters.paymentStatus;
    const matchesRoom = !filters.roomNumber || invoice.bookingId.roomNumber.includes(filters.roomNumber);
    
    const invoiceDate = new Date(invoice.createdAt);
    const matchesDateFrom = !filters.dateFrom || invoiceDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || invoiceDate <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesRoom && matchesDateFrom && matchesDateTo;
  });

  // Export functions
  const exportToCSV = () => {
    const csvData = filteredInvoices.map(inv => ({
      'Số hóa đơn': inv.invoiceNumber || inv._id.slice(-6),
      'Khách hàng': inv.bookingId.representativeName,
      'Phòng': inv.bookingId.roomNumber,
      'Tổng tiền': inv.totalAmount,
      'Đã thanh toán': inv.paidAmount,
      'Còn nợ': inv.totalAmount - inv.paidAmount,
      'Trạng thái': getPaymentStatusLabel(inv.paymentStatus),
      'Ngày tạo': formatDate(inv.createdAt)
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn ${invoice.invoiceNumber || invoice._id.slice(-6)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info { margin-bottom: 20px; }
              .table { width: 100%; border-collapse: collapse; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>HÓA ĐƠN THANH TOÁN</h1>
              <p>Số: ${invoice.invoiceNumber || invoice._id.slice(-6)}</p>
            </div>
            <div class="info">
              <p><strong>Khách hàng:</strong> ${invoice.bookingId.representativeName}</p>
              <p><strong>Phòng:</strong> ${invoice.bookingId.roomNumber}</p>
              <p><strong>Ngày tạo:</strong> ${formatDate(invoice.createdAt)}</p>
            </div>
            <table class="table">
              <tr><th>Khoản thu</th><th>Số tiền</th></tr>
              <tr><td>Tiền phòng</td><td>${formatCurrency(invoice.roomCharges)}</td></tr>
              <tr><td>Dịch vụ</td><td>${formatCurrency(invoice.serviceCharges)}</td></tr>
              <tr><td>Thuế</td><td>${formatCurrency(invoice.taxes)}</td></tr>
              <tr class="total"><td>Tổng cộng</td><td>${formatCurrency(invoice.totalAmount)}</td></tr>
              <tr><td>Đã thanh toán</td><td>${formatCurrency(invoice.paidAmount)}</td></tr>
              <tr><td>Còn nợ</td><td>${formatCurrency(invoice.totalAmount - invoice.paidAmount)}</td></tr>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Handler functions
  const handleViewDetail = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowEditForm(true);
  };

  const handlePayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    
    try {
      await deleteInvoice(invoiceId);
      await fetchInvoices(); // Refresh list
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Có lỗi xảy ra khi xóa hóa đơn');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Hóa đơn</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Xuất CSV
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Tạo hóa đơn
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Bộ lọc & Tìm kiếm</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Số hóa đơn, tên khách..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái hóa đơn</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="draft">Nháp</option>
              <option value="sent">Đã gửi</option>
              <option value="paid">Đã thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái thanh toán</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="partial">Thanh toán 1 phần</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn trả</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Số phòng</label>
            <input
              type="text"
              placeholder="101, 102..."
              value={filters.roomNumber}
              onChange={(e) => setFilters({...filters, roomNumber: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              search: '', status: '', paymentStatus: '', dateFrom: '', dateTo: '', roomNumber: ''
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
            <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-blue-600">
              {(filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Đã thu</p>
            <p className="text-2xl font-bold text-green-600">
              {(filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Còn nợ</p>
            <p className="text-2xl font-bold text-red-600">
              {(filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Chưa thanh toán</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredInvoices.filter(inv => inv.paymentStatus === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách hóa đơn</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
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
                    Thời gian
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
                {filteredInvoices.map((invoice) => (
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
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.bookingId?.checkInDate && formatDate(invoice.bookingId.checkInDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.bookingId?.checkOutDate && formatDate(invoice.bookingId.checkOutDate)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phòng: {formatCurrency(invoice.roomCharges)}
                      </div>
                      {invoice.serviceCharges > 0 && (
                        <div className="text-sm text-gray-500">
                          DV: {formatCurrency(invoice.serviceCharges)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.paidAmount || 0)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(invoice.paymentStatus)}`}>
                        {getPaymentStatusLabel(invoice.paymentStatus)}
                      </span>
                      {invoice.paymentDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(invoice.paymentDate)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        
                        {invoice.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => handlePayment(invoice)}
                            className="text-green-600 hover:text-green-900"
                            title="Thanh toán"
                          >
                            💳
                          </button>
                        )}
                        
                        <button
                          onClick={() => printInvoice(invoice)}
                          className="text-purple-600 hover:text-purple-900"
                          title="In hóa đơn"
                        >
                          🖨️
                        </button>
                        
                        <button
                          onClick={() => handleDelete(invoice._id)}
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

      {/* Create/Edit Invoice Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {showCreateForm ? 'Tạo hóa đơn mới' : 'Chỉnh sửa hóa đơn'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setEditingInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                alert('Chức năng đang phát triển');
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số hóa đơn</label>
                    <input
                      type="text"
                      defaultValue={editingInvoice?.invoiceNumber || ''}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tự động tạo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Khách hàng</label>
                    <input
                      type="text"
                      defaultValue={editingInvoice?.bookingId?.representativeName || ''}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Phòng</label>
                    <input
                      type="text"
                      defaultValue={editingInvoice?.bookingId?.roomNumber || ''}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tổng tiền</label>
                    <input
                      type="number"
                      defaultValue={editingInvoice?.totalAmount || 0}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setShowEditForm(false);
                      setEditingInvoice(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {showCreateForm ? 'Tạo hóa đơn' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Thanh toán hóa đơn</h3>
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Hóa đơn: #{selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">Khách hàng: {selectedInvoice.bookingId?.representativeName}</p>
                <p className="text-lg font-medium">Tổng tiền: {formatCurrency(selectedInvoice.totalAmount)}</p>
                <p className="text-sm text-gray-600">Đã thu: {formatCurrency(selectedInvoice.paidAmount || 0)}</p>
                <p className="text-lg font-medium text-red-600">
                  Còn lại: {formatCurrency(selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0))}
                </p>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const amount = Number(formData.get('amount'));
                const method = formData.get('method') as string;
                processPayment(selectedInvoice._id, amount, method);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền thanh toán</label>
                    <input
                      type="number"
                      name="amount"
                      max={selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
                    <select
                      name="method"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="transfer">Chuyển khoản</option>
                      <option value="card">Thẻ</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedInvoice(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Thanh toán
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Chi tiết hóa đơn</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Thông tin hóa đơn</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Số hóa đơn:</span> #{selectedInvoice.invoiceNumber}</p>
                    <p><span className="font-medium">Ngày tạo:</span> {formatDate(selectedInvoice.createdAt)}</p>
                    <p><span className="font-medium">Trạng thái:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusClass(selectedInvoice.paymentStatus)}`}>
                        {getPaymentStatusLabel(selectedInvoice.paymentStatus)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tên:</span> {selectedInvoice.bookingId?.representativeName}</p>
                    <p><span className="font-medium">Loại:</span> {selectedInvoice.bookingId?.bookingType === 'company' ? 'Công ty' : 'Cá nhân'}</p>
                    <p><span className="font-medium">Phòng:</span> {selectedInvoice.bookingId?.roomNumber}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Chi tiết thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tiền phòng:</span> {formatCurrency(selectedInvoice.roomCharges)}</p>
                    <p><span className="font-medium">Tiền dịch vụ:</span> {formatCurrency(selectedInvoice.serviceCharges)}</p>
                    <p><span className="font-medium">Tổng tiền:</span> {formatCurrency(selectedInvoice.totalAmount)}</p>
                    <p><span className="font-medium">Đã thu:</span> {formatCurrency(selectedInvoice.paidAmount || 0)}</p>
                    <p><span className="font-medium">Còn lại:</span> {formatCurrency(selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0))}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Lịch sử thanh toán</h4>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 ? (
                      selectedInvoice.paymentHistory.map((payment: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <p>{formatCurrency(payment.amount)} - {payment.method}</p>
                          <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Chưa có thanh toán nào</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => printInvoice(selectedInvoice)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  In hóa đơn
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
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
