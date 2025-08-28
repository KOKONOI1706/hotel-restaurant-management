'use client';

import { useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';

// Import our new components
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, CustomerFormData, CustomerFilters } from '@/types/customer';
import StatsCards from '@/components/customers/StatsCards';
import Filters from '@/components/customers/Filters';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerFormModal from '@/components/customers/CustomerFormModal';

export default function CustomersPage() {
  const {
    customers,
    stats,
    filters,
    pagination,
    loading,
    error,
    updateFilters,
    updatePagination,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await deleteCustomer(customerId);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Có lỗi xảy ra khi xóa khách hàng');
      }
    }
  };

  const handleModalSubmit = async (formData: CustomerFormData) => {
    setModalLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, formData);
      } else {
        await createCustomer(formData);
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Có lỗi xảy ra khi lưu thông tin khách hàng');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setModalLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    updateFilters(newFilters);
    // Reset to first page when filters change
    updatePagination({ page: 1 });
  };

  const handleFiltersReset = () => {
    updateFilters({
      search: '',
      customerType: undefined,
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    updatePagination({ page: 1 });
  };

  const handlePaginationChange = (page: number) => {
    updatePagination({ page });
  };

  const handleViewCustomer = (customer: Customer) => {
    // TODO: Implement view customer functionality
    console.log('View customer:', customer);
  };

  const handleCreateBooking = (customer: Customer) => {
    // TODO: Implement create booking functionality
    console.log('Create booking for customer:', customer);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h1>
            <p className="text-gray-600">Quản lý thông tin khách hàng cá nhân và doanh nghiệp</p>
          </div>
          <button 
            onClick={handleAddCustomer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlusIcon className="h-5 w-5" />
            Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Filters */}
      <div className="mb-6">
        <Filters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
          resultCount={customers.length}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Có lỗi xảy ra
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <CustomerTable
        customers={customers}
        pagination={pagination}
        loading={loading}
        error={error}
        onPaginationChange={handlePaginationChange}
        onEditCustomer={handleEditCustomer}
        onViewCustomer={handleViewCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onCreateBooking={handleCreateBooking}
      />

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleModalSubmit}
        customer={editingCustomer}
        loading={modalLoading}
      />
    </div>
  );
}
