'use client';

import { useState } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  pagination: Pagination;
  isLoading?: boolean;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPayment: (invoice: Invoice) => void;
  onExport: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onPageChange: (page: number) => void;
}

export default function InvoiceTable({
  invoices,
  pagination,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onPayment,
  onExport,
  onPrint,
  onPageChange,
}: InvoiceTableProps) {
  const getStatusBadge = (status: string, paymentStatus?: string) => {
    const statusConfig = {
      draft: { label: 'Nháp', class: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Đã gửi', class: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
    };

    const paymentConfig = {
      pending: { label: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800' },
      partial: { label: 'Thanh toán một phần', class: 'bg-blue-100 text-blue-800' },
      refunded: { label: 'Đã hoàn tiền', class: 'bg-gray-100 text-gray-800' },
    };

    const config = paymentStatus ? paymentConfig[paymentStatus as keyof typeof paymentConfig] : 
                   statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || status}
      </span>
    );
  };

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.customerName || invoice.companyName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.roomNumber}
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
                  <div className={`text-sm font-medium ${getRemainingAmount(invoice) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {formatCurrency(getRemainingAmount(invoice))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status, invoice.paymentStatus)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
              {pagination.total} hóa đơn
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + Math.max(1, pagination.page - 2);
                if (page > pagination.pages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      page === pagination.page
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
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
