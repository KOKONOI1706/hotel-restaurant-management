'use client';

import { useState } from 'react';
import { Invoice, InvoiceListResponse } from '@/lib/services/invoices';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface InvoiceTableProps {
  invoices: Invoice[];
  pagination: InvoiceListResponse['pagination'] | null;
  totals: InvoiceListResponse['totals'] | null;
  loading: boolean;
  error: string | null;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPayment: (invoice: Invoice) => void;
  onExport: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onPageChange: (page: number) => void;
}

// Component con cho Status Badge
interface StatusBadgeProps {
  paymentStatus: string;
}

function StatusBadge({ paymentStatus }: StatusBadgeProps) {
  const paymentConfig = {
    pending: { label: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800 border border-green-200' },
    partial: { label: 'Thanh toán một phần', class: 'bg-orange-100 text-orange-800 border border-orange-200' },
    refunded: { label: 'Đã hoàn tiền', class: 'bg-red-100 text-red-800 border border-red-200' },
  };

  const config = paymentConfig[paymentStatus as keyof typeof paymentConfig];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
      {config?.label || paymentStatus}
    </span>
  );
}

export default function InvoiceTable({
  invoices,
  pagination,
  totals,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onPayment,
  onExport,
  onPrint,
  onPageChange,
}: InvoiceTableProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRemainingAmount = (invoice: Invoice) => {
    return invoice.totalAmount - invoice.paidAmount;
  };

  const getRemainingAmountClass = (remaining: number) => {
    return remaining > 0 ? 'text-red-600' : 'text-green-600';
  };

  // Component con cho một hàng invoice
  const renderInvoiceRow = (invoice: Invoice) => (
    <tr key={invoice._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {invoice.invoiceNumber}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {invoice.customerName || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {invoice.roomNumber || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(invoice.totalAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-green-600">
          {formatCurrency(invoice.paidAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${getRemainingAmountClass(getRemainingAmount(invoice))}`}>
          {formatCurrency(getRemainingAmount(invoice))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge paymentStatus={invoice.paymentStatus} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {formatDate(invoice.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(invoice)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          
          {invoice.paymentStatus !== 'paid' && (
            <>
              <button
                onClick={() => onEdit(invoice)}
                className="text-blue-600 hover:text-blue-900 p-1"
                title="Chỉnh sửa"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onPayment(invoice)}
                className="text-green-600 hover:text-green-900 p-1"
                title="Thanh toán"
              >
                <CurrencyDollarIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onDelete(invoice)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Xóa"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => onPrint(invoice)}
            className="text-gray-600 hover:text-gray-900 p-1"
            title="In hóa đơn"
          >
            <PrinterIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onExport(invoice)}
            className="text-purple-600 hover:text-purple-900 p-1"
            title="Xuất PDF"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  // Component con cho dòng tổng cộng
  const renderTotalRow = () => {
    if (!totals) return null;

    const remainingTotal = totals.totalAmount - totals.totalPaid;

    return (
      <tr className="bg-gray-50 font-semibold">
        <td colSpan={3} className="px-6 py-4 text-sm text-gray-900">
          Tổng cộng
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-gray-900">
            {formatCurrency(totals.totalAmount)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-green-600">
            {formatCurrency(totals.totalPaid)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-bold ${getRemainingAmountClass(remainingTotal)}`}>
            {formatCurrency(remainingTotal)}
          </div>
        </td>
        <td colSpan={3} className="px-6 py-4"></td>
      </tr>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Đã xảy ra lỗi
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main table render
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Danh sách hóa đơn</h3>
      </div>

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
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã trả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Còn nợ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => renderInvoiceRow(invoice))}
            {renderTotalRow()}
          </tbody>
        </table>
      </div>

      {/* Pagination - với kiểm tra null an toàn */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} đến{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} trong tổng số{' '}
              {pagination.totalItems} hóa đơn
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + Math.max(1, pagination.currentPage - 2);
                if (page > pagination.totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      page === pagination.currentPage
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
