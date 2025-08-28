'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PrinterIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  // Viettel vInvoice fields
  invoiceSerial?: string; // Ký hiệu hóa đơn
  invoiceTemplate?: string; // Mẫu số hóa đơn
  viettelInvoiceId?: string; // ID hóa đơn trên hệ thống Viettel
  invoiceType: 'VAT' | 'SALE' | 'OTHER'; // Loại hóa đơn
  
  // Customer info - Enhanced for tax compliance
  customerName: string;
  customerType: 'individual' | 'company';
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerTaxCode?: string; // Mã số thuế (bắt buộc với doanh nghiệp)
  
  // Booking info
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  
  // Invoice items
  items: InvoiceItem[];
  
  // Financial info - VAT compliant
  subtotal: number;
  vatRate: number; // Thuế suất VAT (0%, 5%, 8%, 10%)
  vatAmount: number; // Tiền thuế VAT
  discountAmount: number;
  totalBeforeVAT: number; // Tổng tiền trước thuế
  totalAmount: number; // Tổng tiền sau thuế
  
  // Payment & Status
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'adjusted';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
  paymentDate?: string;
  dueDate: string;
  
  // E-invoice specific
  isElectronic: boolean;
  electronicStatus?: 'pending' | 'issued' | 'signed' | 'sent' | 'error' | 'draft';
  signDate?: string; // Ngày ký
  releaseDate?: string; // Ngày phát hành
  lookupCode?: string; // Mã tra cứu
  verificationCode?: string; // Mã xác thực
  
  createdAt: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'room' | 'service' | 'food' | 'other';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: '',
    dateRange: 'all',
    sortBy: 'createdAt'
  });

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockInvoices: Invoice[] = [
        {
          _id: '1',
          invoiceNumber: 'INV-2025-001',
          invoiceSerial: 'C22TBT',
          invoiceTemplate: '01GTKT0/001',
          invoiceType: 'VAT',
          customerName: 'Nguyễn Văn A',
          customerType: 'individual',
          customerEmail: 'nguyenvana@email.com',
          customerPhone: '0901234567',
          customerAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
          roomNumber: '201',
          checkInDate: '2025-01-15',
          checkOutDate: '2025-01-17',
          items: [
            {
              id: '1',
              name: 'Phòng Deluxe',
              description: '2 đêm',
              quantity: 2,
              unitPrice: 1500000,
              total: 3000000,
              type: 'room'
            },
            {
              id: '2',
              name: 'Ăn sáng buffet',
              description: '2 người x 2 ngày',
              quantity: 4,
              unitPrice: 250000,
              total: 1000000,
              type: 'food'
            }
          ],
          subtotal: 4000000,
          vatRate: 10,
          vatAmount: 400000,
          discountAmount: 200000,
          totalBeforeVAT: 3800000,
          totalAmount: 4200000,
          status: 'paid',
          paymentMethod: 'card',
          paymentDate: '2025-01-17',
          dueDate: '2025-01-20',
          isElectronic: true,
          electronicStatus: 'signed',
          signDate: '2025-01-17',
          releaseDate: '2025-01-17',
          lookupCode: 'T9X4F3L8P1',
          verificationCode: '20250117HCM001',
          createdAt: '2025-01-15',
          notes: 'Khách hàng VIP'
        },
        {
          _id: '2',
          invoiceNumber: 'INV-2025-002',
          invoiceSerial: 'C22TBT',
          invoiceTemplate: '01GTKT0/001',
          invoiceType: 'VAT',
          customerName: 'Công ty ABC',
          customerType: 'company',
          customerEmail: 'contact@abc.com',
          customerPhone: '0287654321',
          customerAddress: '456 Lê Lợi, Q1, TP.HCM',
          customerTaxCode: '0123456789',
          roomNumber: '301',
          checkInDate: '2025-01-16',
          checkOutDate: '2025-01-18',
          items: [
            {
              id: '1',
              name: 'Phòng Suite',
              description: '2 đêm',
              quantity: 2,
              unitPrice: 2500000,
              total: 5000000,
              type: 'room'
            },
            {
              id: '2',
              name: 'Massage thư giãn',
              description: '2 người',
              quantity: 2,
              unitPrice: 500000,
              total: 1000000,
              type: 'service'
            }
          ],
          subtotal: 6000000,
          vatRate: 10,
          vatAmount: 600000,
          discountAmount: 300000,
          totalBeforeVAT: 5700000,
          totalAmount: 6300000,
          status: 'issued',
          dueDate: '2025-01-25',
          isElectronic: true,
          electronicStatus: 'sent',
          signDate: '2025-01-16',
          releaseDate: '2025-01-16',
          lookupCode: 'M2K8N5Q3R7',
          createdAt: '2025-01-16',
          notes: 'Hợp đồng dài hạn'
        },
        {
          _id: '3',
          invoiceNumber: 'INV-2025-003',
          invoiceSerial: 'C22TBT',
          invoiceTemplate: '01GTKT0/001',
          invoiceType: 'VAT',
          customerName: 'Trần Thị B',
          customerType: 'individual',
          customerEmail: 'tranthib@email.com',
          customerPhone: '0912345678',
          customerAddress: '789 Hai Bà Trưng, Q3, TP.HCM',
          roomNumber: '102',
          checkInDate: '2025-01-18',
          checkOutDate: '2025-01-19',
          items: [
            {
              id: '1',
              name: 'Phòng Standard',
              description: '1 đêm',
              quantity: 1,
              unitPrice: 800000,
              total: 800000,
              type: 'room'
            }
          ],
          subtotal: 800000,
          vatRate: 10,
          vatAmount: 80000,
          discountAmount: 0,
          totalBeforeVAT: 800000,
          totalAmount: 880000,
          status: 'overdue',
          dueDate: '2025-01-22',
          isElectronic: true,
          electronicStatus: 'issued',
          signDate: '2025-01-18',
          releaseDate: '2025-01-18',
          lookupCode: 'B5V7X2C9D1',
          createdAt: '2025-01-18'
        },
        {
          _id: '4',
          invoiceNumber: 'INV-2025-004',
          invoiceSerial: 'C22TBT',
          invoiceTemplate: '01GTKT0/001',
          invoiceType: 'VAT',
          customerName: 'Lê Văn C',
          customerType: 'individual',
          customerEmail: 'levanc@email.com',
          customerPhone: '0923456789',
          customerAddress: '321 Trần Hưng Đạo, Q5, TP.HCM',
          items: [
            {
              id: '1',
              name: 'Đưa đón sân bay',
              description: '2 chuyến',
              quantity: 2,
              unitPrice: 350000,
              total: 700000,
              type: 'service'
            }
          ],
          subtotal: 700000,
          vatRate: 10,
          vatAmount: 70000,
          discountAmount: 50000,
          totalBeforeVAT: 650000,
          totalAmount: 720000,
          status: 'draft',
          dueDate: '2025-01-30',
          isElectronic: false,
          createdAt: '2025-01-20'
        }
      ];
      
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !filters.search || 
      invoice.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || invoice.status === filters.status;
    const matchesPaymentMethod = !filters.paymentMethod || invoice.paymentMethod === filters.paymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Nháp', class: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
      issued: { label: 'Đã phát hành', class: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      sent: { label: 'Đã gửi', class: 'bg-purple-100 text-purple-800', icon: ClockIcon },
      paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      overdue: { label: 'Quá hạn', class: 'bg-red-100 text-red-800', icon: XCircleIcon },
      cancelled: { label: 'Đã hủy', class: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
      adjusted: { label: 'Đã điều chỉnh', class: 'bg-yellow-100 text-yellow-800', icon: DocumentTextIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config?.icon || DocumentTextIcon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        <IconComponent className="h-3 w-3" />
        {config?.label || status}
      </span>
    );
  };

  const getPaymentMethodBadge = (method?: string) => {
    if (!method) return <span className="text-gray-400">-</span>;
    
    const methodConfig = {
      cash: { label: 'Tiền mặt', class: 'bg-green-100 text-green-800', icon: BanknotesIcon },
      card: { label: 'Thẻ', class: 'bg-blue-100 text-blue-800', icon: CreditCardIcon },
      transfer: { label: 'Chuyển khoản', class: 'bg-purple-100 text-purple-800', icon: BanknotesIcon },
      other: { label: 'Khác', class: 'bg-gray-100 text-gray-800', icon: BanknotesIcon }
    };

    const config = methodConfig[method as keyof typeof methodConfig];
    const IconComponent = config?.icon || BanknotesIcon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        <IconComponent className="h-3 w-3" />
        {config?.label || method}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTotalRevenue = () => {
    return invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  };

  const getOverdueAmount = () => {
    return invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Hóa đơn</h1>
        <button 
          onClick={() => setShowInvoiceForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Tạo hóa đơn
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Số hóa đơn, tên khách hàng..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="draft">Nháp</option>
              <option value="issued">Đã phát hành</option>
              <option value="sent">Đã gửi</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
              <option value="cancelled">Đã hủy</option>
              <option value="adjusted">Đã điều chỉnh</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Thanh toán</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="other">Khác</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Thời gian</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sắp xếp</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="dueDate">Hạn thanh toán</option>
              <option value="totalAmount">Tổng tiền</option>
              <option value="customerName">Tên khách hàng</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', status: '', paymentMethod: '', dateRange: 'all', sortBy: 'createdAt' })}
              className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getTotalRevenue()).split(' ')[0]}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">HĐ điện tử</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.isElectronic).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quá hạn</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có hóa đơn nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số hóa đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại HĐ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hạn thanh toán
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.invoiceSerial && `${invoice.invoiceSerial} - ${invoice.invoiceTemplate}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.customerEmail}
                      </div>
                      {invoice.customerType === 'company' && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Công ty
                          </span>
                          {invoice.customerTaxCode && (
                            <span className="text-xs text-gray-600">
                              MST: {invoice.customerTaxCode}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceType}
                      </div>
                      {invoice.roomNumber && (
                        <div className="text-sm text-gray-500">
                          Phòng {invoice.roomNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        VAT {invoice.vatRate}%: {formatCurrency(invoice.vatAmount)}
                      </div>
                      {invoice.discountAmount > 0 && (
                        <div className="text-sm text-green-600">
                          Giảm: {formatCurrency(invoice.discountAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                      {invoice.paymentDate && (
                        <div className="text-sm text-gray-500 mt-1">
                          TT: {formatDate(invoice.paymentDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.isElectronic ? (
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.electronicStatus === 'signed' ? 'bg-green-100 text-green-800' :
                            invoice.electronicStatus === 'issued' ? 'bg-blue-100 text-blue-800' :
                            invoice.electronicStatus === 'sent' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.electronicStatus === 'signed' ? 'Đã ký' :
                             invoice.electronicStatus === 'issued' ? 'Đã phát hành' :
                             invoice.electronicStatus === 'sent' ? 'Đã gửi' : 'Chờ xử lý'}
                          </span>
                          {invoice.lookupCode && (
                            <div className="text-xs text-gray-600 mt-1">
                              Mã TC: {invoice.lookupCode}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Hóa đơn giấy</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(invoice.dueDate)}
                      </div>
                      {new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && (
                        <span className="text-xs text-red-600 font-medium">
                          Quá hạn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="In hóa đơn"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                        {invoice.isElectronic && invoice.lookupCode && (
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Tra cứu hóa đơn điện tử"
                            onClick={() => window.open(`https://tracuuhoadon.gdt.gov.vn/tcnnt/mstdn.jsp?cks=${invoice.lookupCode}`, '_blank')}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        {invoice.isElectronic && invoice.electronicStatus === 'draft' && (
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Phát hành hóa đơn điện tử"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Chi tiết hóa đơn {selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                <p><strong>Tên:</strong> {selectedInvoice.customerName}</p>
                <p><strong>Email:</strong> {selectedInvoice.customerEmail}</p>
                <p><strong>Điện thoại:</strong> {selectedInvoice.customerPhone}</p>
                <p><strong>Loại:</strong> {selectedInvoice.customerType === 'company' ? 'Công ty' : 'Cá nhân'}</p>
                {selectedInvoice.customerAddress && (
                  <p><strong>Địa chỉ:</strong> {selectedInvoice.customerAddress}</p>
                )}
                {selectedInvoice.customerTaxCode && (
                  <p><strong>MST:</strong> {selectedInvoice.customerTaxCode}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Thông tin thanh toán</h4>
                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedInvoice.status)}</p>
                <p><strong>Hạn thanh toán:</strong> {formatDate(selectedInvoice.dueDate)}</p>
                {selectedInvoice.paymentMethod && (
                  <p><strong>Phương thức:</strong> {getPaymentMethodBadge(selectedInvoice.paymentMethod)}</p>
                )}
                {selectedInvoice.paymentDate && (
                  <p><strong>Ngày thanh toán:</strong> {formatDate(selectedInvoice.paymentDate)}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Hóa đơn điện tử</h4>
                <p><strong>Loại hóa đơn:</strong> {selectedInvoice.invoiceType}</p>
                {selectedInvoice.isElectronic ? (
                  <>
                    <p><strong>Ký hiệu:</strong> {selectedInvoice.invoiceSerial}</p>
                    <p><strong>Mẫu số:</strong> {selectedInvoice.invoiceTemplate}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedInvoice.electronicStatus === 'signed' ? 'bg-green-100 text-green-800' :
                        selectedInvoice.electronicStatus === 'issued' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedInvoice.electronicStatus === 'signed' ? 'Đã ký' :
                         selectedInvoice.electronicStatus === 'issued' ? 'Đã phát hành' : 'Chờ xử lý'}
                      </span>
                    </p>
                    {selectedInvoice.lookupCode && (
                      <p><strong>Mã tra cứu:</strong> {selectedInvoice.lookupCode}</p>
                    )}
                    {selectedInvoice.verificationCode && (
                      <p><strong>Mã xác thực:</strong> {selectedInvoice.verificationCode}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">Hóa đơn giấy</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Chi tiết dịch vụ</h4>
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-3 py-2 text-left">Dịch vụ</th>
                    <th className="border px-3 py-2 text-center">Số lượng</th>
                    <th className="border px-3 py-2 text-right">Đơn giá</th>
                    <th className="border px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-3 py-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </td>
                      <td className="border px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border px-3 py-2 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between mb-2">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Thuế VAT ({selectedInvoice.vatRate}%):</span>
                    <span>{formatCurrency(selectedInvoice.vatAmount)}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2 border-t pt-2">
                    <span>Thành tiền (chưa VAT):</span>
                    <span>{formatCurrency(selectedInvoice.totalBeforeVAT)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Tổng cộng (có VAT):</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedInvoice.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <strong>Ghi chú:</strong> {selectedInvoice.notes}
              </div>
            )}
            
            {/* Viettel vInvoice Actions */}
            {selectedInvoice.isElectronic && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-900">Thao tác hóa đơn điện tử</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInvoice.electronicStatus === 'draft' && (
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                      Phát hành HĐ điện tử
                    </button>
                  )}
                  {selectedInvoice.electronicStatus === 'issued' && (
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                      Ký số hóa đơn
                    </button>
                  )}
                  {selectedInvoice.electronicStatus === 'signed' && (
                    <>
                      <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm">
                        Gửi hóa đơn
                      </button>
                      <button 
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                        onClick={() => {
                          if (selectedInvoice.lookupCode) {
                            window.open(`https://tracuuhoadon.gdt.gov.vn/tcnnt/mstdn.jsp?cks=${selectedInvoice.lookupCode}`, '_blank');
                          }
                        }}
                      >
                        Tra cứu trên CQT
                      </button>
                    </>
                  )}
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                    Hủy hóa đơn
                  </button>
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm">
                    Điều chỉnh/Thay thế
                  </button>
                </div>
                
                {selectedInvoice.lookupCode && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Hướng dẫn tra cứu hóa đơn:</strong>
                    </p>
                    <p className="text-sm">
                      Truy cập: <a href="https://tracuuhoadon.gdt.gov.vn" target="_blank" className="text-blue-600 underline">https://tracuuhoadon.gdt.gov.vn</a>
                    </p>
                    <p className="text-sm">
                      Mã tra cứu: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedInvoice.lookupCode}</span>
                    </p>
                    {selectedInvoice.verificationCode && (
                      <p className="text-sm">
                        Mã xác thực: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedInvoice.verificationCode}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Tạo hóa đơn mới</h3>
            <p className="text-gray-600 mb-4">Tính năng đang được phát triển...</p>
            <button
              onClick={() => setShowInvoiceForm(false)}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
