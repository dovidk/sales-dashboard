export interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  quarterlyGrowth: QuarterComparisonData[];
  topCustomers: Customer[];
  monthlyData: MonthlyData[];
}

export interface Customer {
  customer_id: string;
  company_name: string;
  total_revenue: number;
  order_count: number;
}

export interface QuarterlyData {
  quarter: number;
  year: number;
  revenue: number;
  orders: number;
}

export interface QuarterComparisonData extends QuarterlyData { }

export interface MonthlyData {
  year: number;
  month: number;
  revenue: number;
  order_count: number;
}

export interface CustomerOrder {
  order_id: number;
  order_date: string;
  total_value: number;
  item_count: number;
}

export interface QuarterComparisonResult {
  quarter1: QuarterlyData;
  quarter2: QuarterlyData;
  comparison: {
    revenueGrowth: number;
    orderGrowth: number;
    avgOrderValueQ1: number;
    avgOrderValueQ2: number;
  };
}

export interface DrillDownState {
  type: 'customer' | 'quarter' | 'comparison' | null;
  data: Customer | QuarterlyData | null;
  customerOrders?: CustomerOrder[];
  comparisonData?: QuarterComparisonResult;
}

export interface Product {
  product_id: number;
  product_name: string;
}

export type PeriodPreset = 'all-time' | '1996' | '1997' | '1998' | 'custom';