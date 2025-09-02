'use client';

import { useState, useEffect } from 'react';
import { CalendarDaysIcon, FunnelIcon } from '@heroicons/react/24/outline';
import SummaryCards, { StatusBadges } from '@/components/dashboard/SummaryCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import InvoiceTable from '@/components/dashboard/InvoiceTable';

interface DashboardSummary {
  totals: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    debt: number;
  };
  statusCounts: {
    paid: number;
    pending: number;
    partial: number;
    refunded: number;
  };
  roomStats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
    cleaningRooms: number;
  };
  bookingStats: {
    totalBookings: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  };
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName?: string;
  companyName?: string;
  roomNumber: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdAt: string;
  dueDate?: string;
}

interface RevenueData {
  date: string;
  paidAmount: number;
  debt: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentStatus: '',
    customerName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [pagination.page, filters]);

  useEffect(() => {
    if (filters.dateFrom && filters.dateTo) {
      loadRevenueChart();
    }
  }, [filters.dateFrom, filters.dateTo]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/summary');
      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.error || 'Không thể tải dữ liệu dashboard');
      }
    } catch (error) {
      setError('Lỗi mạng');
      console.error('Load dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data.invoices);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Không thể tải danh sách hóa đơn');
      }
    } catch (error) {
      setError('Lỗi mạng');
      console.error('Load invoices error:', error);
    }
  };

  const loadRevenueChart = async () => {
    try {
      const params = new URLSearchParams({
        from: filters.dateFrom,
        to: filters.dateTo,
        granularity: 'day',
      });

      const response = await fetch(`/api/dashboard/revenue-chart?${params}`);
      const data = await response.json();

      if (data.success) {
        setRevenueData(data.data);
      } else {
        console.error('Load revenue chart error:', data.error);
      }
    } catch (error) {
      console.error('Load revenue chart error:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleInvoiceView = (invoice: Invoice) => {
    // TODO: Open invoice detail modal
    console.log('View invoice:', invoice);
  };

  const handleInvoiceEdit = (invoice: Invoice) => {
    // TODO: Open edit invoice modal
    console.log('Edit invoice:', invoice);
  };

  const handleInvoiceDelete = async (invoice: Invoice) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;
    
    try {
      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadInvoices();
        loadDashboardData();
      } else {
        const data = await response.json();
        alert(data.error || 'Không thể xóa hóa đơn');
      }
    } catch (error) {
      alert('Lỗi mạng');
    }
  };

  const handleInvoicePayment = (invoice: Invoice) => {
    // TODO: Open payment modal
    console.log('Payment for invoice:', invoice);
  };

  const handleInvoiceExport = (invoice: Invoice) => {
    // TODO: Export to PDF
    console.log('Export invoice:', invoice);
  };

  const handleInvoicePrint = (invoice: Invoice) => {
    // TODO: Print invoice
    console.log('Print invoice:', invoice);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard</h1>
        <div className="text-sm text-gray-500">
          Quản lý hóa đơn và doanh thu khách sạn
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <SummaryCards summary={summary} isLoading={isLoading} />}

      {/* Status Badges */}
      {summary && (
        <StatusBadges statusCounts={summary.statusCounts} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
          <FunnelIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái thanh toán
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="partial">Thanh toán một phần</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khách hàng
            </label>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={filters.customerName}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <RevenueChart data={revenueData} isLoading={false} />
      )}

      {/* Invoice Table */}
      <InvoiceTable
        invoices={invoices}
        pagination={pagination}
        isLoading={isLoading}
        onView={handleInvoiceView}
        onEdit={handleInvoiceEdit}
        onDelete={handleInvoiceDelete}
        onPayment={handleInvoicePayment}
        onExport={handleInvoiceExport}
        onPrint={handleInvoicePrint}
        onPageChange={handlePageChange}
      />
    </div>
  );
}