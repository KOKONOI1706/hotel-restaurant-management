import { useState, useEffect } from 'react';
import { Customer, CustomerFormData } from '@/types/customer';
import { 
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  customer?: Customer | null;
  loading?: boolean;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  customer,
  loading = false
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    customerType: 'individual',
    cccd: '',
    companyName: '',
    taxCode: '',
    address: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
        cccd: customer.cccd || '',
        companyName: customer.companyName || '',
        taxCode: customer.taxCode || '',
        address: customer.address || '',
        notes: customer.notes || ''
      });
    } else {
      // Reset form for new customer
      setFormData({
        name: '',
        email: '',
        phone: '',
        customerType: 'individual',
        cccd: '',
        companyName: '',
        taxCode: '',
        address: '',
        notes: ''
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleInputChange = (key: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Company specific validation
    if (formData.customerType === 'company') {
      if (!formData.companyName?.trim()) {
        newErrors.companyName = 'Tên công ty là bắt buộc';
      }
      if (!formData.taxCode?.trim()) {
        newErrors.taxCode = 'Mã số thuế là bắt buộc';
      } else if (!/^[0-9]{10}$/.test(formData.taxCode)) {
        newErrors.taxCode = 'Mã số thuế phải có 10 chữ số';
      }
    }

    // Individual specific validation
    if (formData.customerType === 'individual' && formData.cccd) {
      if (!/^[0-9]{12}$/.test(formData.cccd)) {
        newErrors.cccd = 'CCCD phải có 12 chữ số';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Clean up form data based on customer type
      const cleanData: CustomerFormData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      };

      if (formData.customerType === 'individual') {
        cleanData.companyName = undefined;
        cleanData.taxCode = undefined;
        cleanData.cccd = formData.cccd?.trim() || undefined;
      } else {
        cleanData.cccd = undefined;
        cleanData.companyName = formData.companyName?.trim();
        cleanData.taxCode = formData.taxCode?.trim();
      }

      await onSubmit(cleanData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            {formData.customerType === 'company' ? (
              <BuildingOfficeIcon className="h-5 w-5" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
            {customer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại khách hàng *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  name="customerType"
                  value="individual"
                  checked={formData.customerType === 'individual'}
                  onChange={(e) => handleInputChange('customerType', e.target.value as 'individual' | 'company')}
                  className="sr-only"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                  ${formData.customerType === 'individual' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <UserIcon className="h-5 w-5 mr-2" />
                  Cá nhân
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  name="customerType"
                  value="company"
                  checked={formData.customerType === 'company'}
                  onChange={(e) => handleInputChange('customerType', e.target.value as 'individual' | 'company')}
                  className="sr-only"
                />
                <div className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                  ${formData.customerType === 'company' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Công ty
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.customerType === 'company' ? 'Tên người liên hệ' : 'Họ và tên'} *
              </label>
              <div className="relative">
                <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Company Name (if company) */}
            {formData.customerType === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên công ty *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên công ty"
                  />
                </div>
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <div className="relative">
                <PhoneIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0912345678"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* CCCD (if individual) */}
            {formData.customerType === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số CCCD
                </label>
                <div className="relative">
                  <IdentificationIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.cccd}
                    onChange={(e) => handleInputChange('cccd', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cccd ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123456789012"
                    maxLength={12}
                  />
                </div>
                {errors.cccd && <p className="mt-1 text-sm text-red-600">{errors.cccd}</p>}
              </div>
            )}

            {/* Tax Code (if company) */}
            {formData.customerType === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã số thuế *
                </label>
                <div className="relative">
                  <IdentificationIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => handleInputChange('taxCode', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.taxCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0123456789"
                    maxLength={10}
                  />
                </div>
                {errors.taxCode && <p className="mt-1 text-sm text-red-600">{errors.taxCode}</p>}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <div className="relative">
              <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <div className="relative">
              <DocumentTextIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú thêm về khách hàng"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
            >
              {(submitting || loading) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {customer ? 'Cập nhật' : 'Thêm khách hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
