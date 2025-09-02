'use client';

import { DashboardSummary } from '@/lib/services/dashboard';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface SummaryCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="flex items-center">
            <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SummaryCards({ summary, loading, error }: SummaryCardsProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading summary: {error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No summary data available</p>
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
      name: 'Công nợ',
      value: `${summary.totals.debt.toLocaleString('vi-VN')} VND`,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      name: 'Phòng khả dụng',
      value: `${summary.roomStats?.availableRooms || 0}/${summary.roomStats?.totalRooms || 0}`,
      icon: BuildingOfficeIcon,
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
    { key: 'paid', label: 'Đã thanh toán', count: statusCounts.paid, color: 'bg-green-100 text-green-800 border border-green-200' },
    { key: 'pending', label: 'Chờ thanh toán', count: statusCounts.pending, color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    { key: 'partial', label: 'Thanh toán một phần', count: statusCounts.partial, color: 'bg-orange-100 text-orange-800 border border-orange-200' },
    { key: 'refunded', label: 'Đã hoàn tiền', count: statusCounts.refunded, color: 'bg-red-100 text-red-800 border border-red-200' },
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
