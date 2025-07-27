import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardData, Customer, QuarterlyData } from '../types/index';

interface ChartsGridProps {
  data: DashboardData;
  selectedProductId: number | null;
  selectedProductName: string;
  onCustomerClick: (customer: Customer) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export const ChartsGrid: React.FC<ChartsGridProps> = ({
  data,
  selectedProductId,
  selectedProductName,
  onCustomerClick
}) => {
  const quarterlyChartData = data.quarterlyGrowth.map(q => ({
    quarter: `Q${q.quarter} ${q.year}`,
    revenue: Math.round(q.revenue),
    orders: q.orders,
    fullData: q
  }));

  const monthlyChartData = data.monthlyData.map(m => ({
    month: `${m.year}-${String(m.month).padStart(2, '0')}`,
    revenue: Math.round(m.revenue),
    orders: m.order_count
  }));

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>
          {selectedProductId
            ? `${selectedProductName} - Quarterly Revenue Trend`
            : 'Quarterly Revenue Trend - All Products'
          }
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={quarterlyChartData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value: any, name: string) => [
                name === 'revenue' ? `${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{ r: 6, cursor: 'pointer' }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>
          {selectedProductId
            ? `${selectedProductName} - Monthly Revenue Progression`
            : 'Monthly Revenue Progression - All Products'
          }
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card customers-card">
        <h3>Top 10 Customers by Revenue</h3>
        <div className="customers-list">
          {data.topCustomers.map((customer, index) => (
            <div
              key={customer.customer_id}
              className="customer-item"
              onClick={() => onCustomerClick(customer)}
            >
              <div className="customer-rank">#{index + 1}</div>
              <div className="customer-info">
                <div className="customer-name">{customer.company_name}</div>
                <div className="customer-revenue">${Math.round(customer.total_revenue).toLocaleString()}</div>
              </div>
              <div className="customer-orders">{customer.order_count} orders</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <h3>Top 6 Customers Revenue Share</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.topCustomers.slice(0, 6)}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="total_revenue"
              nameKey="company_name"
              label={({ company_name, percent }) => `${company_name.split(' ')[0]} ${(percent! * 100).toFixed(1)}%`}
            >
              {data.topCustomers.slice(0, 6).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${Math.round(Number(value)).toLocaleString()}`, 'Revenue']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};