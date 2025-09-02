'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Invoice } from '@/lib/services/invoices';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceDetailModal({ invoice, isOpen, onClose }: InvoiceDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (paymentStatus: string) => {
    const config = {
      pending: { label: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800' },
      partial: { label: 'Thanh toán một phần', class: 'bg-orange-100 text-orange-800' },
      refunded: { label: 'Đã hoàn tiền', class: 'bg-red-100 text-red-800' },
    };

    const statusConfig = config[paymentStatus as keyof typeof config];
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig?.class || 'bg-gray-100 text-gray-800'}`}>
        {statusConfig?.label || paymentStatus}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Chi tiết hóa đơn #{invoice.invoiceNumber}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số hóa đơn:</span>
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium">{invoice.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số phòng:</span>
                    <span className="font-medium">{invoice.roomNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(invoice.paymentStatus)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin thời gian</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium">{formatDate(invoice.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cập nhật:</span>
                    <span className="font-medium">{formatDate(invoice.updatedAt)}</span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hạn thanh toán:</span>
                      <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Financial Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin tài chính</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đã thanh toán:</span>
                    <span className="text-lg font-semibold text-green-600">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Còn nợ:</span>
                    <span className={`text-lg font-semibold ${invoice.dueAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {formatCurrency(invoice.dueAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Tiến độ thanh toán</h4>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(invoice.paidAmount / invoice.totalAmount) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>0%</span>
                  <span className="font-medium">
                    {Math.round((invoice.paidAmount / invoice.totalAmount) * 100)}% đã thanh toán
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Chi tiết hóa đơn</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Mô tả</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Số lượng</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Đơn giá</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-2 text-center text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Lịch sử thanh toán</h4>
              <div className="space-y-3">
                {invoice.paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-green-600">
                        {formatDate(payment.date)} • {payment.method}
                      </div>
                      {payment.note && (
                        <div className="text-sm text-gray-600 mt-1">{payment.note}</div>
                      )}
                    </div>
                    <div className="text-green-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
