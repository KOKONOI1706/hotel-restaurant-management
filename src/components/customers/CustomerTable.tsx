import { Customer, PaginationOptions } from '@/types/customer';
import CustomerRow from './CustomerRow';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  pagination: PaginationOptions;
  onPaginationChange: (page: number) => void;
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onCreateBooking?: (customer: Customer) => void;
}

export default function CustomerTable({
  customers,
  loading,
  error,
  pagination,
  onPaginationChange,
  onEditCustomer,
  onViewCustomer,
  onDeleteCustomer,
  onCreateBooking
}: CustomerTableProps) {
  const totalPages = Math.ceil((pagination.total || 0) / pagination.limit);
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total || 0);

  const renderPaginationButton = (
    page: number | 'prev' | 'next' | 'first' | 'last',
    label: string | React.ReactNode,
    disabled: boolean = false
  ) => {
    const isActive = typeof page === 'number' && page === pagination.page;
    
    let targetPage = pagination.page;
    if (page === 'prev') targetPage = pagination.page - 1;
    else if (page === 'next') targetPage = pagination.page + 1;
    else if (page === 'first') targetPage = 1;
    else if (page === 'last') targetPage = totalPages;
    else if (typeof page === 'number') targetPage = page;

    return (
      <button
        key={typeof page === 'string' ? page : `page-${page}`}
        onClick={() => !disabled && onPaginationChange(targetPage)}
        disabled={disabled || isActive}
        className={`
          px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${isActive 
            ? 'bg-blue-600 text-white cursor-default' 
            : disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }
        `}
      >
        {label}
      </button>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and previous
    if (totalPages > maxVisiblePages) {
      pages.push(renderPaginationButton('first', <ChevronDoubleLeftIcon className="h-4 w-4" />, pagination.page === 1));
    }
    pages.push(renderPaginationButton('prev', <ChevronLeftIcon className="h-4 w-4" />, pagination.page === 1));

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i, i.toString()));
    }

    // Next and last page
    pages.push(renderPaginationButton('next', <ChevronRightIcon className="h-4 w-4" />, pagination.page === totalPages));
    if (totalPages > maxVisiblePages) {
      pages.push(renderPaginationButton('last', <ChevronDoubleRightIcon className="h-4 w-4" />, pagination.page === totalPages));
    }

    return (
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            {/* Mobile pagination */}
            {renderPaginationButton('prev', 'Trước', pagination.page === 1)}
            {renderPaginationButton('next', 'Sau', pagination.page === totalPages)}
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
                <span className="font-medium">{endItem}</span> trong{' '}
                <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
            
            <div className="flex items-center space-x-1">
              {pages}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có khách hàng nào</h3>
          <p className="text-gray-500">Hãy thêm khách hàng đầu tiên của bạn</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại & Giấy tờ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thống kê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <CustomerRow
                    key={customer._id}
                    customer={customer}
                    onEdit={onEditCustomer}
                    onView={onViewCustomer}
                    onDelete={() => onDeleteCustomer(customer._id)}
                    onCreateBooking={onCreateBooking}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
}
