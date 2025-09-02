import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardSummary, DashboardFilter, RevenueChartData } from '@/lib/services/dashboard';

interface UseDashboardResult {
  // Summary data
  summary: DashboardSummary | null;
  summaryLoading: boolean;
  summaryError: string | null;

  // Chart data  
  chartData: RevenueChartData[];
  chartLoading: boolean;
  chartError: string | null;

  // Actions
  refreshSummary: (filter?: DashboardFilter) => Promise<void>;
  loadChartData: (from: string, to: string, granularity?: 'day' | 'month') => Promise<void>;
  loadDefaultChart: () => Promise<void>;
}

export function useDashboard(initialFilter?: DashboardFilter): UseDashboardResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<RevenueChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const refreshSummary = useCallback(async (filter?: DashboardFilter) => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const data = await dashboardService.getSummary(filter);
      setSummary(data);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadChartData = useCallback(async (
    from: string, 
    to: string, 
    granularity: 'day' | 'month' = 'day'
  ) => {
    try {
      setChartLoading(true);
      setChartError(null);
      const data = await dashboardService.getRevenueChart(from, to, granularity);
      setChartData(data);
    } catch (error) {
      setChartError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setChartLoading(false);
    }
  }, []);

  const loadDefaultChart = useCallback(async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      const data = await dashboardService.getDefaultChartData();
      setChartData(data);
    } catch (error) {
      setChartError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary(initialFilter);
    loadDefaultChart();
  }, [refreshSummary, loadDefaultChart, initialFilter]);

  return {
    summary,
    summaryLoading,
    summaryError,
    chartData,
    chartLoading,
    chartError,
    refreshSummary,
    loadChartData,
    loadDefaultChart,
  };
}
