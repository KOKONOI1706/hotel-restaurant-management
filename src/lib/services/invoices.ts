// Client-side services for invoice API calls
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  roomNumber?: string;
  bookingId?: string;
  customerId?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentHistory?: Array<{
    amount: number;
    date: string;
    method: string;
    note?: string;
  }>;
}

export interface InvoiceFilter {
  customerName?: string;
  paymentStatus?: string;
  roomNumber?: string;
  invoiceNumber?: string;
  minAmount?: number;
  maxAmount?: number;
  from?: string;
  to?: string;
}

export interface InvoiceListResponse {
  data: Invoice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  totals: {
    totalAmount: number;
    totalPaid: number;
    pageAmount: number;
    pagePaid: number;
  };
}

export interface CreateInvoiceData {
  customerName: string;
  roomNumber?: string;
  bookingId?: string;
  customerId?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
}

export interface UpdateInvoiceData {
  customerName?: string;
  roomNumber?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
}

export interface ProcessPaymentData {
  amount: number;
  method: string;
  note?: string;
}

class InvoiceService {
  private baseUrl = '/api/invoices';

  async getInvoices(
    page: number = 1,
    limit: number = 10,
    filter?: InvoiceFilter
  ): Promise<InvoiceListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filter parameters
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoices');
    }

    const apiResponse = await response.json();
    
    // Handle the API response structure: { success: true, data: { invoices: [...], pagination: {...} } }
    if (apiResponse.success && apiResponse.data) {
      return {
        data: apiResponse.data.invoices || [],
        pagination: apiResponse.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        totals: apiResponse.data.totals || { totalAmount: 0, totalPaid: 0, pageAmount: 0, pagePaid: 0 }
      };
    }
    
    throw new Error('Invalid response format');
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoice');
    }

    const data = await response.json();
    return data.data;
  }

  async createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invoice');
    }

    const data = await response.json();
    return data.data;
  }

  async updateInvoice(id: string, invoiceData: UpdateInvoiceData): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update invoice');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete invoice');
    }
  }

  async processPayment(id: string, paymentData: ProcessPaymentData): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/${id}/payment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process payment');
    }

    const data = await response.json();
    return data.data;
  }

  async exportInvoicePDF(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${id}/export`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/pdf',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to export PDF');
    }

    return response.blob();
  }
}

export const invoiceService = new InvoiceService();
