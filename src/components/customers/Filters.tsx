import { CustomerFilters } from '@/types/customer';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

interface FiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onReset: () => void;
  resultCount?: number;
}

export default function Filters({ filters, onFiltersChange, onReset, resultCount }: FiltersProps) {
  const handleFilterChange = (key: keyof CustomerFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
          {resultCount !== undefined && (
            <span className="text-sm text-gray-500">
              ({resultCount} kết quả)
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tên, email, điện thoại, CCCD, MST..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Customer Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại khách hàng
          </label>
          <select
            value={filters.customerType || ''}
            onChange={(e) => handleFilterChange('customerType', e.target.value || undefined)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="individual">Cá nhân</option>
            <option value="company">Công ty</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="name">Tên</option>
            <option value="totalSpent">Tổng chi tiêu</option>
            <option value="totalBookings">Số booking</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự
          </label>
          <button
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-center gap-2"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
            {filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.customerType) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
          
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tìm kiếm: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.customerType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Loại: {filters.customerType === 'individual' ? 'Cá nhân' : 'Công ty'}
              <button
                onClick={() => handleFilterChange('customerType', '')}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
