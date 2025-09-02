import { useState, useEffect, useCallback } from 'react';
import { 
  invoiceService, 
  Invoice, 
  InvoiceFilter, 
  InvoiceListResponse,
  CreateInvoiceData,
  UpdateInvoiceData,
  ProcessPaymentData
} from '@/lib/services/invoices';

interface UseInvoicesResult {
  // List data
  invoices: Invoice[];
  invoiceLoading: boolean;
  invoiceError: string | null;
  pagination: InvoiceListResponse['pagination'] | null;
  totals: InvoiceListResponse['totals'] | null;

  // Single invoice
  currentInvoice: Invoice | null;
  currentInvoiceLoading: boolean;
  currentInvoiceError: string | null;

  // Actions
  loadInvoices: (page?: number, limit?: number, filter?: InvoiceFilter) => Promise<void>;
  loadInvoiceById: (id: string) => Promise<void>;
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice | null>;
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  processPayment: (id: string, data: ProcessPaymentData) => Promise<Invoice | null>;
  exportPDF: (id: string) => Promise<Blob | null>;
  refreshInvoices: () => Promise<void>;
}

export function useInvoices(
  initialPage: number = 1,
  initialLimit: number = 10,
  initialFilter?: InvoiceFilter
): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<InvoiceListResponse['pagination'] | null>(null);
  const [totals, setTotals] = useState<InvoiceListResponse['totals'] | null>(null);

  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentInvoiceLoading, setCurrentInvoiceLoading] = useState(false);
  const [currentInvoiceError, setCurrentInvoiceError] = useState<string | null>(null);

  // Store current filter and pagination for refresh
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [currentFilter, setCurrentFilter] = useState(initialFilter);

  const loadInvoices = useCallback(async (
    page: number = 1,
    limit: number = 10,
    filter?: InvoiceFilter
  ) => {
    try {
      setInvoiceLoading(true);
      setInvoiceError(null);
      
      const response = await invoiceService.getInvoices(page, limit, filter);
      
      // Ensure response.data is an array
      if (response && response.data && Array.isArray(response.data)) {
        setInvoices(response.data);
      } else {
        console.error('Invalid invoices response:', response);
        setInvoices([]);
      }
      
      setPagination(response.pagination);
      setTotals(response.totals);
      
      // Store current state for refresh
      setCurrentPage(page);
      setCurrentLimit(limit);
      setCurrentFilter(filter);
    } catch (error) {
      console.error('Load invoices error:', error);
      setInvoiceError(error instanceof Error ? error.message : 'An error occurred');
      setInvoices([]); // Ensure invoices is always an array
    } finally {
      setInvoiceLoading(false);
    }
  }, []);

  const loadInvoiceById = useCallback(async (id: string) => {
    try {
      setCurrentInvoiceLoading(true);
      setCurrentInvoiceError(null);
      const invoice = await invoiceService.getInvoiceById(id);
      setCurrentInvoice(invoice);
    } catch (error) {
      setCurrentInvoiceError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setCurrentInvoiceLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (data: CreateInvoiceData): Promise<Invoice | null> => {
    try {
      const invoice = await invoiceService.createInvoice(data);
      // Refresh list to include new invoice
      await loadInvoices(currentPage, currentLimit, currentFilter);
      return invoice;
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : 'Failed to create invoice');
      return null;
    }
  }, [currentPage, currentLimit, currentFilter, loadInvoices]);

  const updateInvoice = useCallback(async (
    id: string, 
    data: UpdateInvoiceData
  ): Promise<Invoice | null> => {
    try {
      const invoice = await invoiceService.updateInvoice(id, data);
      
      // Update current invoice if it's the same
      if (currentInvoice?._id === id) {
        setCurrentInvoice(invoice);
      }
      
      // Refresh list to reflect changes
      await loadInvoices(currentPage, currentLimit, currentFilter);
      return invoice;
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : 'Failed to update invoice');
      return null;
    }
  }, [currentInvoice, currentPage, currentLimit, currentFilter, loadInvoices]);

  const deleteInvoice = useCallback(async (id: string): Promise<boolean> => {
    try {
      await invoiceService.deleteInvoice(id);
      
      // Clear current invoice if it's the deleted one
      if (currentInvoice?._id === id) {
        setCurrentInvoice(null);
      }
      
      // Refresh list
      await loadInvoices(currentPage, currentLimit, currentFilter);
      return true;
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : 'Failed to delete invoice');
      return false;
    }
  }, [currentInvoice, currentPage, currentLimit, currentFilter, loadInvoices]);

  const processPayment = useCallback(async (
    id: string, 
    data: ProcessPaymentData
  ): Promise<Invoice | null> => {
    try {
      const invoice = await invoiceService.processPayment(id, data);
      
      // Update current invoice if it's the same
      if (currentInvoice?._id === id) {
        setCurrentInvoice(invoice);
      }
      
      // Refresh list to reflect payment status changes
      await loadInvoices(currentPage, currentLimit, currentFilter);
      return invoice;
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : 'Failed to process payment');
      return null;
    }
  }, [currentInvoice, currentPage, currentLimit, currentFilter, loadInvoices]);

  const exportPDF = useCallback(async (id: string): Promise<Blob | null> => {
    try {
      const blob = await invoiceService.exportInvoicePDF(id);
      return blob;
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : 'Failed to export PDF');
      return null;
    }
  }, []);

  const refreshInvoices = useCallback(async () => {
    await loadInvoices(currentPage, currentLimit, currentFilter);
  }, [currentPage, currentLimit, currentFilter, loadInvoices]);

  // Load initial data
  useEffect(() => {
    loadInvoices(initialPage, initialLimit, initialFilter);
  }, [loadInvoices, initialPage, initialLimit, initialFilter]);

  return {
    invoices,
    invoiceLoading,
    invoiceError,
    pagination,
    totals,
    currentInvoice,
    currentInvoiceLoading,
    currentInvoiceError,
    loadInvoices,
    loadInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    processPayment,
    exportPDF,
    refreshInvoices,
  };
}
