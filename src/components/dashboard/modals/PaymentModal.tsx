'use client';

import { useState } from 'react';
import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Invoice, ProcessPaymentData } from '@/lib/services/invoices';

interface PaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProcessPaymentData) => Promise<void>;
  loading?: boolean;
}

export default function PaymentModal({ invoice, isOpen, onClose, onSubmit, loading = false }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const remainingAmount = invoice.dueAmount;
  const maxPayment = remainingAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (paymentAmount > maxPayment) {
      setError(`Số tiền không được vượt quá ${formatCurrency(maxPayment)}`);
      return;
    }

    try {
      await onSubmit({
        amount: paymentAmount,
        method,
        note: note.trim() || undefined
      });
      
      // Reset form
      setAmount('');
      setMethod('cash');
      setNote('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'bank_transfer', label: 'Chuyển khoản' },
    { value: 'credit_card', label: 'Thẻ tín dụng' },
    { value: 'e_wallet', label: 'Ví điện tử' },
    { value: 'other', label: 'Khác' }
  ];

  const quickAmounts = [
    { label: '50%', value: Math.round(remainingAmount * 0.5) },
    { label: '75%', value: Math.round(remainingAmount * 0.75) },
    { label: 'Toàn bộ', value: remainingAmount }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ghi nhận thanh toán</h3>
                <p className="text-sm text-gray-600">Hóa đơn #{invoice.invoiceNumber}</p>
              </div>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Invoice Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã thanh toán:</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-medium">Còn nợ:</span>
                <span className="font-bold text-red-600">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền thanh toán <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  max={maxPayment}
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">VND</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tối đa: {formatCurrency(maxPayment)}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền nhanh:
              </label>
              <div className="flex space-x-2">
                {quickAmounts.map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    onClick={() => setAmount(quick.value.toString())}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm về khoản thanh toán..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !amount || parseFloat(amount) <= 0}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
