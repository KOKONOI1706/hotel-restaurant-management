'use client';

import { useState } from 'react';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface SummaryCardsProps {
  summary: {
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
  };
  isLoading?: boolean;
}

export default function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      name: 'Tổng hóa đơn',
      value: summary.totals.totalInvoices,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Đã thu',
      value: `${summary.totals.paidAmount.toLocaleString('vi-VN')} VND`,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Còn nợ',
      value: `${summary.totals.debt.toLocaleString('vi-VN')} VND`,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      name: 'Tổng tiền',
      value: `${summary.totals.totalAmount.toLocaleString('vi-VN')} VND`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.name} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.name}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {typeof card.value === 'string' ? card.value : card.value.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StatusBadgesProps {
  statusCounts: {
    paid: number;
    pending: number;
    partial: number;
    refunded: number;
  };
}

export function StatusBadges({ statusCounts }: StatusBadgesProps) {
  const statuses = [
    { key: 'paid', label: 'Đã thanh toán', count: statusCounts.paid, color: 'bg-green-100 text-green-800' },
    { key: 'pending', label: 'Chờ thanh toán', count: statusCounts.pending, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'partial', label: 'Thanh toán một phần', count: statusCounts.partial, color: 'bg-blue-100 text-blue-800' },
    { key: 'refunded', label: 'Đã hoàn tiền', count: statusCounts.refunded, color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái hóa đơn</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <div key={status.key} className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-2">{status.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
