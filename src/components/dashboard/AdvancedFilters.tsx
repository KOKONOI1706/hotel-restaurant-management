'use client';

import { useState } from 'react';
import { InvoiceFilter } from '@/lib/services/invoices';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AdvancedFiltersProps {
  filter: InvoiceFilter;
  onFilterChange: (filter: InvoiceFilter) => void;
  onClearFilters: () => void;
}

export default function AdvancedFilters({ filter, onFilterChange, onClearFilters }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof InvoiceFilter, value: string | number | undefined) => {
    onFilterChange({
      ...filter,
      [key]: value === '' ? undefined : value
    });
  };

  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isExpanded ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>
      </div>

      {/* Basic Filters - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khách hàng
          </label>
          <div className="relative">
            <input
              type="text"
              value={filter.customerName || ''}
              onChange={(e) => handleFilterChange('customerName', e.target.value)}
              placeholder="Nhập tên khách hàng..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái thanh toán
          </label>
          <select
            value={filter.paymentStatus || ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="partial">Thanh toán một phần</option>
            <option value="paid">Đã thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={filter.from || ''}
            onChange={(e) => handleFilterChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={filter.to || ''}
            onChange={(e) => handleFilterChange('to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số hóa đơn
            </label>
            <input
              type="text"
              value={filter.invoiceNumber || ''}
              onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
              placeholder="Nhập số hóa đơn..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số phòng
            </label>
            <input
              type="text"
              value={filter.roomNumber || ''}
              onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
              placeholder="Nhập số phòng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền tối thiểu
            </label>
            <input
              type="number"
              value={filter.minAmount || ''}
              onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền tối đa
            </label>
            <input
              type="number"
              value={filter.maxAmount || ''}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Không giới hạn"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Bộ lọc đang áp dụng:</h4>
          <div className="flex flex-wrap gap-2">
            {filter.customerName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Khách hàng: {filter.customerName}
                <button
                  onClick={() => handleFilterChange('customerName', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-700"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filter.paymentStatus && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Trạng thái: {filter.paymentStatus}
                <button
                  onClick={() => handleFilterChange('paymentStatus', undefined)}
                  className="ml-1 text-green-600 hover:text-green-700"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filter.roomNumber && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Phòng: {filter.roomNumber}
                <button
                  onClick={() => handleFilterChange('roomNumber', undefined)}
                  className="ml-1 text-purple-600 hover:text-purple-700"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
