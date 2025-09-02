// Client-side services for dashboard API calls
export interface DashboardSummary {
  totals: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    debt: number;
  };
  statusCounts: {
    paid: number;
    pending: number;
    partial: number;
    refunded: number;
  };
  roomStats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
  };
  bookingStats: {
    totalBookings: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  };
}

export interface DashboardFilter {
  from?: string;
  to?: string;
}

export interface RevenueChartData {
  date: string;
  paidAmount: number;
  debt: number;
}

class DashboardService {
  private baseUrl = '/api/dashboard';

  async getSummary(filter?: DashboardFilter): Promise<DashboardSummary> {
    const params = new URLSearchParams();
    if (filter?.from) params.append('from', filter.from);
    if (filter?.to) params.append('to', filter.to);

    const url = `${this.baseUrl}/summary${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard summary');
    }

    const data = await response.json();
    return data.data;
  }

  async getRevenueChart(
    from: string, 
    to: string, 
    granularity: 'day' | 'month' = 'day'
  ): Promise<RevenueChartData[]> {
    const params = new URLSearchParams({
      from,
      to,
      granularity
    });

    const response = await fetch(`${this.baseUrl}/revenue-chart?${params.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch revenue chart data');
    }

    const data = await response.json();
    return data.data;
  }

  // Get default chart data for last 30 days
  async getDefaultChartData(): Promise<RevenueChartData[]> {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);

    return this.getRevenueChart(
      from.toISOString(),
      to.toISOString(),
      'day'
    );
  }
}

export const dashboardService = new DashboardService();
