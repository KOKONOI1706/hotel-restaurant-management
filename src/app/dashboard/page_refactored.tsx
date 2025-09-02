'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceFilter } from '@/lib/services/invoices';
import { DashboardFilter } from '@/lib/services/dashboard';
import SummaryCards, { StatusBadges } from '@/components/dashboard/SummaryCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import AdvancedFilters from '@/components/dashboard/AdvancedFilters';
import EnhancedInvoiceTable from '@/components/dashboard/EnhancedInvoiceTable';
import InvoiceDetailModal from '@/components/dashboard/modals/InvoiceDetailModal2';
import PaymentModal from '@/components/dashboard/modals/PaymentModal';

export default function DashboardPage() {
  // Hooks
  const {
    summary,
    summaryLoading,
    summaryError,
    chartData,
    chartLoading,
    chartError,
    refreshSummary,
    loadChartData,
    loadDefaultChart,
  } = useDashboard();

  const {
    invoices,
    invoiceLoading,
    invoiceError,
    pagination,
    totals,
    currentInvoice,
    currentInvoiceLoading,
    loadInvoices,
    loadInvoiceById,
    processPayment,
    exportPDF,
    refreshInvoices,
  } = useInvoices();

  // State
  const [filter, setFilter] = useState<InvoiceFilter>({});
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chartFilter, setChartFilter] = useState({
    from: '',
    to: ''
  });

  // Handlers
  const handleFilterChange = (newFilter: InvoiceFilter) => {
    setFilter(newFilter);
    loadInvoices(1, 10, newFilter);
    
    // Update summary with filter
    if (newFilter.from || newFilter.to) {
      const dashboardFilter: DashboardFilter = { 
        from: newFilter.from, 
        to: newFilter.to 
      };
      refreshSummary(dashboardFilter);
    } else {
      refreshSummary();
    }
  };

  const handleClearFilters = () => {
    const emptyFilter: InvoiceFilter = {};
    setFilter(emptyFilter);
    loadInvoices(1, 10, emptyFilter);
    refreshSummary();
  };

  const handlePageChange = (page: number) => {
    loadInvoices(page, 10, filter);
  };

  const handleInvoiceView = async (invoice: any) => {
    setSelectedInvoice(invoice._id);
    await loadInvoiceById(invoice._id);
    setShowDetailModal(true);
  };

  const handleInvoiceEdit = (invoice: any) => {
    // TODO: Implement edit modal
    console.log('Edit invoice:', invoice);
  };

  const handleInvoiceDelete = async (invoice: any) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hóa đơn ${invoice.invoiceNumber}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await refreshInvoices();
        await refreshSummary();
      } else {
        const data = await response.json();
        alert(data.error || 'Không thể xóa hóa đơn');
      }
    } catch (error) {
      alert('Lỗi mạng khi xóa hóa đơn');
    }
  };

  const handleInvoicePayment = async (invoice: any) => {
    setSelectedInvoice(invoice._id);
    await loadInvoiceById(invoice._id);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!selectedInvoice) return;
    
    const result = await processPayment(selectedInvoice, paymentData);
    if (result) {
      setShowPaymentModal(false);
      await refreshSummary();
    }
  };

  const handleInvoiceExport = async (invoice: any) => {
    try {
      const blob = await exportPDF(invoice._id);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Lỗi khi xuất PDF');
    }
  };

  const handleInvoicePrint = (invoice: any) => {
    // TODO: Implement print functionality
    console.log('Print invoice:', invoice);
  };

  const handleChartDateRangeChange = (from: string, to: string) => {
    setChartFilter({ from, to });
    if (from && to) {
      loadChartData(from, to);
    } else {
      loadDefaultChart();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard</h1>
        <div className="text-sm text-gray-500">
          Quản lý hóa đơn và doanh thu khách sạn
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        summary={summary} 
        loading={summaryLoading} 
        error={summaryError} 
      />

      {/* Status Badges */}
      {summary && !summaryLoading && (
        <StatusBadges statusCounts={summary.statusCounts} />
      )}

      {/* Chart Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Biểu đồ doanh thu</h3>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={chartFilter.from}
                onChange={(e) => handleChartDateRangeChange(e.target.value, chartFilter.to)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={chartFilter.to}
                onChange={(e) => handleChartDateRangeChange(chartFilter.from, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadDefaultChart}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                30 ngày gần nhất
              </button>
            </div>
          </div>
        </div>
        
        <RevenueChart 
          data={chartData} 
          loading={chartLoading} 
          error={chartError} 
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Enhanced Invoice Table */}
      <EnhancedInvoiceTable
        invoices={invoices}
        pagination={pagination}
        totals={totals}
        loading={invoiceLoading}
        error={invoiceError}
        onView={handleInvoiceView}
        onEdit={handleInvoiceEdit}
        onDelete={handleInvoiceDelete}
        onPayment={handleInvoicePayment}
        onExport={handleInvoiceExport}
        onPrint={handleInvoicePrint}
        onPageChange={handlePageChange}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={currentInvoice}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        invoice={currentInvoice}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        loading={currentInvoiceLoading}
      />
    </div>
  );
}
