import { NextRequest, NextResponse } from 'next/server';

// Viettel vInvoice API integration
// Docs: https://vinvoice.viettel.vn/developers

interface ViettelInvoiceRequest {
  action: 'create' | 'sign' | 'send' | 'cancel' | 'lookup' | 'adjust';
  invoiceData?: {
    templateCode: string; // Mẫu số hóa đon
    invoiceSerial: string; // Ký hiệu hóa đơn
    customerName: string;
    customerTaxCode?: string;
    customerAddress?: string;
    customerEmail?: string;
    customerPhone?: string;
    items: Array<{
      name: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      total: number;
      vatRate: number;
    }>;
    totalBeforeVAT: number;
    vatAmount: number;
    totalAmount: number;
    discountAmount?: number;
    paymentMethod?: string;
    notes?: string;
  };
  invoiceId?: string;
  lookupCode?: string;
}

interface ViettelInvoiceResponse {
  success: boolean;
  data?: {
    invoiceId?: string;
    invoiceNumber?: string;
    lookupCode?: string;
    verificationCode?: string;
    signDate?: string;
    releaseDate?: string;
    status?: string;
    pdf?: string; // Base64 PDF
    xml?: string; // XML data
  };
  error?: {
    code: string;
    message: string;
  };
}

// Mock Viettel API credentials - should be in environment variables
const VIETTEL_CONFIG = {
  apiUrl: process.env.VIETTEL_API_URL || 'https://vinvoice-api.viettel.vn',
  username: process.env.VIETTEL_USERNAME || '',
  password: process.env.VIETTEL_PASSWORD || '',
  companyTaxCode: process.env.COMPANY_TAX_CODE || '0123456789',
  templateCode: process.env.INVOICE_TEMPLATE || '01GTKT0/001',
  serialSymbol: process.env.INVOICE_SERIAL || 'C22TBT'
};

export async function POST(request: NextRequest) {
  try {
    const body: ViettelInvoiceRequest = await request.json();
    
    // Validate required fields
    if (!body.action) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ACTION', message: 'Action is required' } },
        { status: 400 }
      );
    }

    let response: ViettelInvoiceResponse;

    switch (body.action) {
      case 'create':
        response = await createInvoice(body.invoiceData!);
        break;
      case 'sign':
        response = await signInvoice(body.invoiceId!);
        break;
      case 'send':
        response = await sendInvoice(body.invoiceId!);
        break;
      case 'cancel':
        response = await cancelInvoice(body.invoiceId!);
        break;
      case 'lookup':
        response = await lookupInvoice(body.lookupCode!);
        break;
      case 'adjust':
        response = await adjustInvoice(body.invoiceId!, body.invoiceData!);
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action' } },
          { status: 400 }
        );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Viettel vInvoice API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Internal server error' 
        } 
      },
      { status: 500 }
    );
  }
}

async function createInvoice(invoiceData: ViettelInvoiceRequest['invoiceData']): Promise<ViettelInvoiceResponse> {
  // Mock implementation - replace with actual Viettel API call
  
  const viettelPayload = {
    templateCode: VIETTEL_CONFIG.templateCode,
    invoiceSerial: VIETTEL_CONFIG.serialSymbol,
    companyTaxCode: VIETTEL_CONFIG.companyTaxCode,
    customer: {
      name: invoiceData!.customerName,
      taxCode: invoiceData!.customerTaxCode,
      address: invoiceData!.customerAddress,
      email: invoiceData!.customerEmail,
      phone: invoiceData!.customerPhone
    },
    items: invoiceData!.items.map(item => ({
      itemName: item.name,
      itemDescription: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.total,
      vatRate: item.vatRate
    })),
    totalBeforeVAT: invoiceData!.totalBeforeVAT,
    vatAmount: invoiceData!.vatAmount,
    totalAmount: invoiceData!.totalAmount,
    discountAmount: invoiceData!.discountAmount || 0,
    paymentMethod: invoiceData!.paymentMethod,
    notes: invoiceData!.notes
  };

  try {
    // Mock response - replace with actual API call
    const mockResponse: ViettelInvoiceResponse = {
      success: true,
      data: {
        invoiceId: `VTEL_${Date.now()}`,
        invoiceNumber: `${VIETTEL_CONFIG.serialSymbol}${Date.now().toString().slice(-6)}`,
        status: 'CREATED',
        lookupCode: generateLookupCode(),
        verificationCode: generateVerificationCode()
      }
    };

    /* 
    // Actual API call would be:
    const response = await fetch(`${VIETTEL_CONFIG.apiUrl}/api/invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getViettelToken()}`
      },
      body: JSON.stringify(viettelPayload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    */

    return mockResponse;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'VIETTEL_API_ERROR',
        message: `Failed to create invoice: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}

async function signInvoice(invoiceId: string): Promise<ViettelInvoiceResponse> {
  // Mock implementation
  return {
    success: true,
    data: {
      invoiceId,
      status: 'SIGNED',
      signDate: new Date().toISOString(),
      releaseDate: new Date().toISOString()
    }
  };
}

async function sendInvoice(invoiceId: string): Promise<ViettelInvoiceResponse> {
  // Mock implementation
  return {
    success: true,
    data: {
      invoiceId,
      status: 'SENT'
    }
  };
}

async function cancelInvoice(invoiceId: string): Promise<ViettelInvoiceResponse> {
  // Mock implementation
  return {
    success: true,
    data: {
      invoiceId,
      status: 'CANCELLED'
    }
  };
}

async function lookupInvoice(lookupCode: string): Promise<ViettelInvoiceResponse> {
  // Mock implementation
  return {
    success: true,
    data: {
      lookupCode,
      status: 'VALID',
      verificationCode: generateVerificationCode()
    }
  };
}

async function adjustInvoice(invoiceId: string, newData: ViettelInvoiceRequest['invoiceData']): Promise<ViettelInvoiceResponse> {
  // Mock implementation
  return {
    success: true,
    data: {
      invoiceId: `${invoiceId}_ADJ`,
      status: 'ADJUSTED',
      lookupCode: generateLookupCode()
    }
  };
}

// Helper functions
function generateLookupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateVerificationCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${date}HCM${random}`;
}

/* 
// Function to get authentication token from Viettel
async function getViettelToken(): Promise<string> {
  const response = await fetch(`${VIETTEL_CONFIG.apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: VIETTEL_CONFIG.username,
      password: VIETTEL_CONFIG.password
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to authenticate with Viettel');
  }
  
  const { token } = await response.json();
  return token;
}
*/
