import React from 'react';
import { DashboardData } from '../types/index';

interface KpiCardsProps {
  data: DashboardData;
  growthMetrics: {
    revenueGrowth: number | null;
    orderGrowth: number | null;
  };
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, growthMetrics }) => {
  return (
    <div className="kpi-section">
      <div className="kpi-card revenue">
        <div className="kpi-icon">💰</div>
        <div className="kpi-content">
          <h3>Total Revenue</h3>
          <div className="kpi-value">${data.totalRevenue.toLocaleString()}</div>
          <div className="kpi-trend">
            {growthMetrics.revenueGrowth !== null
              ? `${growthMetrics.revenueGrowth > 0 ? '+' : ''}${growthMetrics.revenueGrowth.toFixed(1)}% QoQ`
              : 'Baseline period'
            }
          </div>
        </div>
      </div>

      <div className="kpi-card orders">
        <div className="kpi-icon">📦</div>
        <div className="kpi-content">
          <h3>Total Orders</h3>
          <div className="kpi-value">{data.totalOrders.toLocaleString()}</div>
          <div className="kpi-trend">
            {growthMetrics.orderGrowth !== null
              ? `${growthMetrics.orderGrowth > 0 ? '+' : ''}${growthMetrics.orderGrowth.toFixed(1)}% QoQ`
              : 'Baseline period'
            }
          </div>
        </div>
      </div>

      <div className="kpi-card avg-order">
        <div className="kpi-icon">📊</div>
        <div className="kpi-content">
          <h3>Avg Order Value</h3>
          <div className="kpi-value">${Math.round(data.avgOrderValue).toLocaleString()}</div>
          <div className="kpi-trend">
            {data.quarterlyGrowth.length >= 2
              ? `${((data.totalRevenue / data.totalOrders) / (data.quarterlyGrowth[data.quarterlyGrowth.length - 2].revenue / data.quarterlyGrowth[data.quarterlyGrowth.length - 2].orders) - 1) * 100 > 0 ? '+' : ''}${(((data.totalRevenue / data.totalOrders) / (data.quarterlyGrowth[data.quarterlyGrowth.length - 2].revenue / data.quarterlyGrowth[data.quarterlyGrowth.length - 2].orders) - 1) * 100).toFixed(1)}% QoQ`
              : 'Baseline period'
            }
          </div>
        </div>
      </div>
    </div>
  );
};