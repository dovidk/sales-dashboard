
import React, { useState, useEffect } from 'react';
import { salesApi } from './api/salesApi';
import { KpiCards } from './components/KPICards';
import { PeriodFilter } from './components/PeriodFilter';
import { QuarterComparison } from './components/QuarterComparison';
import { ProductFilter } from './components/ProductFilter';
import { ChartsGrid } from './components/ChartsGrid';
import { DrillDownModal } from './components/DrillDownModal';
import { DashboardData, DrillDownState, Product, PeriodPreset, Customer } from './types';
import './App.css';

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [drillDown, setDrillDown] = useState<DrillDownState>({ type: null, data: null });
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('All Products');

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('all-time');
  const [customStartDate, setCustomStartDate] = useState('1996-01-01');
  const [customEndDate, setCustomEndDate] = useState('1998-12-31');
  const [currentPeriodLabel, setCurrentPeriodLabel] = useState('All Time');

  const [quarter1, setQuarter1] = useState(1);
  const [year1, setYear1] = useState(1996);
  const [quarter2, setQuarter2] = useState(1);
  const [year2, setYear2] = useState(1997);

  const getDateRange = (period: PeriodPreset): { startDate?: string; endDate?: string; label: string } => {
    switch (period) {
      case 'all-time':
        return { label: 'All Time' };
      case '1996':
        return { startDate: '1996-01-01', endDate: '1996-12-31', label: '1996' };
      case '1997':
        return { startDate: '1997-01-01', endDate: '1997-12-31', label: '1997' };
      case '1998':
        return { startDate: '1998-01-01', endDate: '1998-12-31', label: '1998' };
      case 'custom':
        return { startDate: customStartDate, endDate: customEndDate, label: 'Custom Period' };
      default:
        return { label: 'All Time' };
    }
  };

  const fetchChartData = async (productId?: number | null) => {
    setChartsLoading(true);
    try {
      const [quarterly, monthly] = await Promise.all([
        salesApi.getQuarterlyGrowth(productId || undefined),
        salesApi.getOrdersByMonth(productId || undefined)
      ]);

      setData((prevData) => ({
        ...prevData!,
        quarterlyGrowth: quarterly.data,
        monthlyData: monthly.data
      }));
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setChartsLoading(false);
    }
  };

  const handleProductChange = (productId: number | null, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    fetchChartData(productId);
  };

  const fetchKpiData = async (startDate?: string, endDate?: string) => {
    setKpiLoading(true);
    try {
      const [orders, revenue, avgOrder] = await Promise.all([
        salesApi.getTotalOrders(startDate, endDate),
        salesApi.getTotalRevenue(startDate, endDate),
        salesApi.getAverageOrderValue(startDate, endDate)
      ]);

      setData(prevData => ({
        ...prevData!,
        totalOrders: orders.data.totalOrders,
        totalRevenue: revenue.data.totalRevenue,
        avgOrderValue: avgOrder.data.averageOrderValue
      }));
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setKpiLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [orders, revenue, avgOrder, quarterly, customers, monthly, productsList] = await Promise.all([
          salesApi.getTotalOrders(),
          salesApi.getTotalRevenue(),
          salesApi.getAverageOrderValue(),
          salesApi.getQuarterlyGrowth(),
          salesApi.getTopCustomers(),
          salesApi.getOrdersByMonth(),
          salesApi.getProductsList()
        ]);

        setData({
          totalOrders: orders.data.totalOrders,
          totalRevenue: revenue.data.totalRevenue,
          avgOrderValue: avgOrder.data.averageOrderValue,
          quarterlyGrowth: quarterly.data,
          topCustomers: customers.data,
          monthlyData: monthly.data
        });

        setProducts(productsList.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handlePeriodChange = (period: PeriodPreset) => {
    setSelectedPeriod(period);
    const { startDate, endDate, label } = getDateRange(period);
    setCurrentPeriodLabel(label);
    fetchKpiData(startDate, endDate);
  };

  const handleCustomDateUpdate = () => {
    const { startDate, endDate } = getDateRange('custom');
    setCurrentPeriodLabel(`${customStartDate} to ${customEndDate}`);
    fetchKpiData(startDate, endDate);
  };

  const handleCustomerClick = async (customer: Customer) => {
    try {
      const ordersResponse = await salesApi.getCustomerOrders(customer.customer_id);
      setDrillDown({
        type: 'customer',
        data: customer,
        customerOrders: ordersResponse.data
      });
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setDrillDown({ type: 'customer', data: customer });
    }
  };

  const closeDrillDown = () => {
    setDrillDown({ type: null, data: null });
  };

  const handleCompareQuarters = async () => {
    setComparisonLoading(true);
    try {
      const response = await salesApi.compareQuarters(quarter1, year1, quarter2, year2);
      setDrillDown({
        type: 'comparison',
        data: null,
        comparisonData: response.data
      });
    } catch (error) {
      console.error('Error comparing quarters:', error);
    } finally {
      setComparisonLoading(false);
    }
  };

  const calculateGrowthMetrics = () => {
    if (!data?.quarterlyGrowth || data.quarterlyGrowth.length < 2) {
      return { revenueGrowth: null, orderGrowth: null };
    }

    const sortedQuarters = [...data.quarterlyGrowth].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

    const latest = sortedQuarters[sortedQuarters.length - 1];
    const previous = sortedQuarters[sortedQuarters.length - 2];

    const revenueGrowth = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
    const orderGrowth = ((latest.orders - previous.orders) / previous.orders) * 100;

    return { revenueGrowth, orderGrowth };
  };

  const growthMetrics = calculateGrowthMetrics();

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading Sales Dashboard...</p>
    </div>
  );

  if (!data) return <div className="error">Error loading data</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sales Executive Dashboard</h1>
        <p>Northwind Trading Company • 1996-1998 Performance Analysis</p>
      </header>

      <PeriodFilter
        selectedPeriod={selectedPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        currentPeriodLabel={currentPeriodLabel}
        kpiLoading={kpiLoading}
        onPeriodChange={handlePeriodChange}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
        onCustomDateUpdate={handleCustomDateUpdate}
        setSelectedPeriod={setSelectedPeriod}
      />

      <KpiCards data={data} growthMetrics={growthMetrics} />

      <QuarterComparison
        quarter1={quarter1}
        year1={year1}
        quarter2={quarter2}
        year2={year2}
        comparisonLoading={comparisonLoading}
        onQuarter1Change={(year, quarter) => {
          setYear1(year);
          setQuarter1(quarter);
        }}
        onQuarter2Change={(year, quarter) => {
          setYear2(year);
          setQuarter2(quarter);
        }}
        onCompareQuarters={handleCompareQuarters}
      />

      <ProductFilter
        products={products}
        selectedProductId={selectedProductId}
        selectedProductName={selectedProductName}
        chartsLoading={chartsLoading}
        onProductChange={handleProductChange}
      />

      <ChartsGrid
        data={data}
        selectedProductId={selectedProductId}
        selectedProductName={selectedProductName}
        onCustomerClick={handleCustomerClick}
      />

      <DrillDownModal drillDown={drillDown} onClose={closeDrillDown} />
    </div>
  );
}

export default App;