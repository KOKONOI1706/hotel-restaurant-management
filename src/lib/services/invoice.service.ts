import { Invoice, Booking, Room } from '@/lib/models';
import { Types } from 'mongoose';

export interface InvoiceFilter {
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  roomNumber?: string;
  customerName?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'paidAmount' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInvoices {
  invoices: any[];
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
  bookingId: string;
  customerId?: string;
  serviceIds?: string[];
  roomCharges: number;
  serviceCharges?: number;
  taxes?: number;
  totalAmount: number;
  dueDate?: Date;
  notes?: string;
}

export interface UpdateInvoiceData {
  serviceIds?: string[];
  roomCharges?: number;
  serviceCharges?: number;
  taxes?: number;
  totalAmount?: number;
  dueDate?: Date;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
}

export interface PaymentData {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'online';
  paymentNotes?: string;
}

export async function getInvoicesWithFilter(filter: InvoiceFilter): Promise<PaginatedInvoices> {
  const {
    paymentStatus,
    dateFrom,
    dateTo,
    roomNumber,
    customerName,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filter;

  // Build query
  const query: any = {};

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = dateFrom;
    if (dateTo) query.createdAt.$lte = dateTo;
  }

  if (roomNumber) {
    query.roomNumber = { $regex: roomNumber, $options: 'i' };
  }

  if (customerName) {
    query.$or = [
      { customerName: { $regex: customerName, $options: 'i' } },
      { companyName: { $regex: customerName, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute queries
  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .populate('bookingId', 'representativeName companyName roomNumber checkInDate checkOutDate')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments(query)
  ]);

  // Calculate totals
  const pageInvoices = invoices;
  const pageAmount = pageInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pagePaid = pageInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  
  // Get grand totals (all invoices matching the filter)
  const allInvoices = await Invoice.find(query).select('totalAmount paidAmount').lean();
  const totalAmount = allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = allInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

  return {
    invoices,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    },
    totals: {
      totalAmount,
      totalPaid,
      pageAmount,
      pagePaid
    }
  };
}

export async function getInvoiceById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid invoice ID');
  }

  const invoice = await Invoice.findById(id)
    .populate('bookingId')
    .populate('serviceIds')
    .lean();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
}

export async function createInvoice(data: CreateInvoiceData) {
  // Validate booking exists
  const booking = await Booking.findById(data.bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Get room info
  const room = await Room.findById(booking.roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice data
  const invoiceData = {
    ...data,
    invoiceNumber,
    customerName: booking.bookingType === 'individual' 
      ? booking.representativeName 
      : booking.companyName,
    customerPhone: booking.representativePhone,
    customerEmail: booking.representativeEmail,
    customerAddress: booking.representativeAddress,
    companyName: booking.companyName,
    companyTaxCode: booking.companyTaxCode,
    roomNumber: room.roomNumber,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    status: 'draft',
    paymentStatus: 'pending',
  };

  const invoice = new Invoice(invoiceData);
  await invoice.save();

  return invoice;
}

export async function updateInvoice(id: string, data: UpdateInvoiceData) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid invoice ID');
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Check if invoice can be updated
  if (invoice.paymentStatus === 'paid') {
    throw new Error('Cannot update paid invoice');
  }

  // Update invoice
  Object.assign(invoice, data);
  await invoice.save();

  return invoice;
}

export async function deleteInvoice(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid invoice ID');
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Check if invoice can be deleted
  if (invoice.paymentStatus === 'paid') {
    throw new Error('Cannot delete paid invoice');
  }

  await Invoice.findByIdAndDelete(id);
  return { success: true };
}

export async function processPayment(id: string, paymentData: PaymentData) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid invoice ID');
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.paymentStatus === 'paid') {
    throw new Error('Invoice already paid');
  }

  const { amount, paymentMethod, paymentNotes } = paymentData;
  
  // Validate payment amount
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  if (amount > remainingAmount) {
    throw new Error('Payment amount exceeds remaining balance');
  }

  // Update invoice
  invoice.paidAmount += amount;
  invoice.paymentMethod = paymentMethod;
  invoice.paymentNotes = paymentNotes;
  invoice.paymentDate = new Date();

  // Update payment status
  if (invoice.paidAmount >= invoice.totalAmount) {
    invoice.paymentStatus = 'paid';
    invoice.status = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.paymentStatus = 'partial';
  }

  await invoice.save();

  return invoice;
}

export async function generateInvoiceNumber(): Promise<string> {
  const prefix = 'INV';
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  
  // Find the last invoice of the current month
  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}${year}${month}` }
  }).sort({ invoiceNumber: -1 });

  let sequence = 1;
  if (lastInvoice) {
    const lastNumber = lastInvoice.invoiceNumber.slice(-4);
    sequence = parseInt(lastNumber) + 1;
  }

  return `${prefix}${year}${month}${sequence.toString().padStart(4, '0')}`;
}

export async function getInvoiceStats() {
  const stats = await Invoice.aggregate([
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        paidAmount: { $sum: '$paidAmount' }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
      paidAmount: stat.paidAmount
    };
    return acc;
  }, {} as Record<string, any>);
}
