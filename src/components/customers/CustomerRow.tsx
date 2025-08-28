import { Customer } from '@/types/customer';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  MapPinIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface CustomerRowProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onDelete: () => void;
  onCreateBooking?: (customer: Customer) => void;
}

export default function CustomerRow({ customer, onEdit, onView, onDelete, onCreateBooking }: CustomerRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCustomerTypeBadge = (type: string) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        type === 'individual' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-purple-100 text-purple-800'
      }`}>
        {type === 'individual' ? (
          <>
            <UserIcon className="w-3 h-3 mr-1" />
            Cá nhân
          </>
        ) : (
          <>
            <BuildingOfficeIcon className="w-3 h-3 mr-1" />
            Công ty
          </>
        )}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Customer Info */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {customer.customerType === 'company' ? (
                <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <UserIcon className="h-5 w-5 text-gray-600" />
              )}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.name}
            </div>
            {customer.companyName && (
              <div className="text-sm text-gray-500">
                {customer.companyName}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              ID: {customer._id}
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.address && (
            <div className="flex items-center text-xs text-gray-400">
              <MapPinIcon className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>
      </td>

      {/* Type & Documents */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          {getCustomerTypeBadge(customer.customerType)}
          
          {customer.customerType === 'individual' && customer.cccd && (
            <div className="flex items-center text-xs text-gray-500">
              <IdentificationIcon className="h-3 w-3 mr-1" />
              CCCD: {customer.cccd}
            </div>
          )}
          
          {customer.customerType === 'company' && customer.taxCode && (
            <div className="flex items-center text-xs text-gray-500">
              <IdentificationIcon className="h-3 w-3 mr-1" />
              MST: {customer.taxCode}
            </div>
          )}
        </div>
      </td>

      {/* Statistics */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {customer.totalBookings} booking{customer.totalBookings !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-green-600 font-medium">
            {formatCurrency(customer.totalSpent)}
          </div>
          {customer.totalBookings > 0 && (
            <div className="text-xs text-gray-500">
              TB: {formatCurrency(customer.totalSpent / customer.totalBookings)}/booking
            </div>
          )}
        </div>
      </td>

      {/* Last Booking */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {customer.lastBooking ? (
            <div className="space-y-1">
              <div>{formatDate(customer.lastBooking)}</div>
              <div className="text-xs text-gray-500">
                {Math.floor((new Date().getTime() - new Date(customer.lastBooking).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
              </div>
            </div>
          ) : (
            <span className="text-gray-400">Chưa có booking</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onView(customer)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onEdit(customer)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Xóa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          
          {onCreateBooking && (
            <button
              onClick={() => onCreateBooking(customer)}
              className="text-green-600 hover:text-green-900 transition-colors"
              title="Tạo booking"
            >
              <CalendarDaysIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
