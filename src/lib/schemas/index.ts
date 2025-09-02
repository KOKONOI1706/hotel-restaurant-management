import { z } from 'zod';

// Dashboard query schema
export const DashboardQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Invoice filter schema
export const InvoiceFilterSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'partial', 'refunded']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  roomNumber: z.string().optional(),
  customerName: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'totalAmount', 'paidAmount', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Create invoice schema
export const CreateInvoiceSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  customerId: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
  roomCharges: z.number().min(0, 'Room charges must be non-negative'),
  serviceCharges: z.number().min(0, 'Service charges must be non-negative').default(0),
  taxes: z.number().min(0, 'Taxes must be non-negative').default(0),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Update invoice schema
export const UpdateInvoiceSchema = z.object({
  serviceIds: z.array(z.string()).optional(),
  roomCharges: z.number().min(0, 'Room charges must be non-negative').optional(),
  serviceCharges: z.number().min(0, 'Service charges must be non-negative').optional(),
  taxes: z.number().min(0, 'Taxes must be non-negative').optional(),
  totalAmount: z.number().min(0, 'Total amount must be non-negative').optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
});

// Payment schema
export const PaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'online']),
  paymentNotes: z.string().optional(),
});

// Export query schema
export const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  paymentStatus: z.enum(['pending', 'paid', 'partial', 'refunded']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Revenue chart query schema
export const RevenueChartQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  granularity: z.enum(['day', 'month']).default('day'),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type InvoiceFilter = z.infer<typeof InvoiceFilterSchema>;
export type CreateInvoiceData = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceData = z.infer<typeof UpdateInvoiceSchema>;
export type PaymentData = z.infer<typeof PaymentSchema>;
export type ExportQuery = z.infer<typeof ExportQuerySchema>;
export type RevenueChartQuery = z.infer<typeof RevenueChartQuerySchema>;
