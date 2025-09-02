import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'error';
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  children, 
  size = 'md' 
}) => {
  const statusConfig = {
    pending: {
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳',
      label: 'Chờ xử lý'
    },
    submitted: {
      classes: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '📤',
      label: 'Đã gửi'
    },
    processing: {
      classes: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '⚙️',
      label: 'Đang xử lý'
    },
    completed: {
      classes: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
      label: 'Hoàn thành'
    },
    error: {
      classes: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      label: 'Lỗi'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status];

  return (
    <span className={`
      inline-flex items-center gap-1 font-medium rounded-full border
      ${config.classes}
      ${sizeClasses[size]}
    `}>
      <span>{config.icon}</span>
      {children || config.label}
    </span>
  );
};

interface NotificationSummaryProps {
  notifications: {
    total: number;
    pending: number;
    submitted: number;
    completed: number;
    error: number;
  };
}

export const NotificationSummary: React.FC<NotificationSummaryProps> = ({ notifications }) => {
  const summaryItems = [
    { label: 'Tổng số', value: notifications.total, color: 'text-gray-600' },
    { label: 'Chờ xử lý', value: notifications.pending, color: 'text-yellow-600' },
    { label: 'Đã gửi', value: notifications.submitted, color: 'text-blue-600' },
    { label: 'Hoàn thành', value: notifications.completed, color: 'text-green-600' },
    { label: 'Lỗi', value: notifications.error, color: 'text-red-600' }
  ];

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {summaryItems.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface AutoFillProgressProps {
  currentGuest: number;
  totalGuests: number;
  guestName?: string;
  isActive?: boolean;
}

export const AutoFillProgress: React.FC<AutoFillProgressProps> = ({
  currentGuest,
  totalGuests,
  guestName,
  isActive = false
}) => {
  const percentage = (currentGuest / totalGuests) * 100;

  return (
    <div className={`
      p-4 rounded-lg border-2 transition-all duration-300
      ${isActive 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 bg-white'
      }
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Tiến trình tự động điền
        </span>
        <span className="text-sm text-gray-500">
          {currentGuest}/{totalGuests}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`
            h-2 rounded-full transition-all duration-500 ease-out
            ${isActive ? 'bg-blue-600' : 'bg-gray-400'}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {guestName && (
        <div className="text-xs text-gray-600">
          Hiện tại: <span className="font-medium">{guestName}</span>
        </div>
      )}
      
      {isActive && (
        <div className="flex items-center gap-1 mt-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span className="text-xs text-blue-600">Đang điền thông tin...</span>
        </div>
      )}
    </div>
  );
};

// Helper UI for DichVuCong portal
export const PortalHelper: React.FC = () => {
  return (
    <div 
      id="dichvucong-helper"
      className="fixed top-4 right-4 bg-white shadow-lg rounded-lg border p-4 max-w-sm z-50"
      style={{ display: 'none' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">🏨 Trợ lý điền form</h3>
        <button 
          onClick={() => {
            const helper = document.getElementById('dichvucong-helper');
            if (helper) helper.style.display = 'none';
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Tiến trình:</span>
          <span id="guest-progress" className="ml-2">1/2</span>
        </div>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">Khách hiện tại:</span>
          <div id="current-guest-name" className="text-blue-600 font-medium">
            Nguyễn Văn A
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button 
            id="prev-guest"
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
          >
            ← Trước
          </button>
          <button 
            id="next-guest"
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Tiếp →
          </button>
        </div>
        
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
          💡 Script sẽ tự động điền thông tin từng khách một
        </div>
      </div>
    </div>
  );
};
