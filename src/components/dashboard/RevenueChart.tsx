'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    date: string;
    paidAmount: number;
    debt: number;
  }>;
  isLoading?: boolean;
}

export default function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ doanh thu</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Không có dữ liệu
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Biểu đồ doanh thu</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Đã thu</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Còn nợ</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              formatCurrency(value), 
              name === 'paidAmount' ? 'Đã thu' : 'Còn nợ'
            ]}
            labelFormatter={(label) => `Ngày: ${formatDate(label)}`}
          />
          <Legend />
          <Bar dataKey="paidAmount" fill="#10B981" name="Đã thu" radius={[4, 4, 0, 0]} />
          <Bar dataKey="debt" fill="#EF4444" name="Còn nợ" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CompactRevenueChartProps {
  data: Array<{
    date: string;
    paidAmount: number;
    debt: number;
  }>;
  height?: number;
}

export function CompactRevenueChart({ data, height = 200 }: CompactRevenueChartProps) {
  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" hide />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip 
          formatter={(value: number, name: string) => [
            new Intl.NumberFormat('vi-VN').format(value) + ' VND', 
            name === 'paidAmount' ? 'Đã thu' : 'Còn nợ'
          ]}
        />
        <Line 
          type="monotone" 
          dataKey="paidAmount" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="debt" 
          stroke="#EF4444" 
          strokeWidth={2}
          dot={{ fill: '#EF4444', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
