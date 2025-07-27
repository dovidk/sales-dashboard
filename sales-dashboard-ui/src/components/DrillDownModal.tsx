import React from 'react';
import { DrillDownState, Customer, QuarterlyData } from '../types/index';

interface DrillDownModalProps {
  drillDown: DrillDownState;
  onClose: () => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ drillDown, onClose }) => {
  const isCustomerData = (data: Customer | QuarterlyData | null): data is Customer => {
    return data !== null && 'customer_id' in data;
  };

  const isQuarterlyData = (data: Customer | QuarterlyData | null): data is QuarterlyData => {
    return data !== null && 'quarter' in data;
  };

  if (!drillDown.type || (!drillDown.data && drillDown.type !== 'comparison')) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {drillDown.type === 'customer' ? 'Customer Details' :
              drillDown.type === 'quarter' ? 'Quarter Details' :
                'Quarter Comparison'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {drillDown.type === 'customer' && isCustomerData(drillDown.data) ? (
            <div className="customer-details">
              <h3>{drillDown.data.company_name}</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Customer ID:</label>
                  <span>{drillDown.data.customer_id}</span>
                </div>
                <div className="detail-item">
                  <label>Total Revenue:</label>
                  <span>${Math.round(drillDown.data.total_revenue).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Total Orders:</label>
                  <span>{drillDown.data.order_count}</span>
                </div>
                <div className="detail-item">
                  <label>Avg Order Value:</label>
                  <span>${Math.round(drillDown.data.total_revenue / drillDown.data.order_count).toLocaleString()}</span>
                </div>
              </div>

              {drillDown.customerOrders && (
                <div className="orders-history">
                  <h4>Recent Order History</h4>
                  <div className="orders-list">
                    {drillDown.customerOrders.slice(0, 10).map((order: any, index: number) => (
                      <div key={order.order_id} className="order-item">
                        <div className="order-info">
                          <div className="order-id">Order #{order.order_id}</div>
                          <div className="order-date">
                            {new Date(order.order_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="order-details">
                          <div className="order-value">${Math.round(order.total_value).toLocaleString()}</div>
                          <div className="order-items">{order.item_count} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : drillDown.type === 'quarter' && isQuarterlyData(drillDown.data) ? (
            <div className="quarter-details">
              <h3>Q{drillDown.data.quarter} {drillDown.data.year} Performance</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Revenue:</label>
                  <span>${Math.round(drillDown.data.revenue).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Orders:</label>
                  <span>{drillDown.data.orders}</span>
                </div>
                <div className="detail-item">
                  <label>Avg Order Value:</label>
                  <span>${Math.round(drillDown.data.revenue / drillDown.data.orders).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="comparison-details">
              {drillDown.comparisonData && (
                <>
                  <div className="comparison-header">
                    <h3>Q{drillDown.comparisonData.quarter1.quarter} {drillDown.comparisonData.quarter1.year} vs Q{drillDown.comparisonData.quarter2.quarter} {drillDown.comparisonData.quarter2.year}</h3>
                  </div>

                  <div className="comparison-overview">
                    <div className="comparison-metric">
                      <div className="metric-label">Revenue Growth</div>
                      <div className={`metric-value ${drillDown.comparisonData.comparison.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {drillDown.comparisonData.comparison.revenueGrowth >= 0 ? '+' : ''}{drillDown.comparisonData.comparison.revenueGrowth}%
                      </div>
                    </div>
                    <div className="comparison-metric">
                      <div className="metric-label">Order Growth</div>
                      <div className={`metric-value ${drillDown.comparisonData.comparison.orderGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {drillDown.comparisonData.comparison.orderGrowth >= 0 ? '+' : ''}{drillDown.comparisonData.comparison.orderGrowth}%
                      </div>
                    </div>
                  </div>

                  <div className="quarters-comparison">
                    <div className="quarter-column">
                      <h4>Q{drillDown.comparisonData.quarter1.quarter} {drillDown.comparisonData.quarter1.year}</h4>
                      <div className="quarter-stats">
                        <div className="stat-item">
                          <span className="stat-label">Revenue:</span>
                          <span className="stat-value">${Math.round(drillDown.comparisonData.quarter1.revenue).toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Orders:</span>
                          <span className="stat-value">{drillDown.comparisonData.quarter1.orders}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Avg Order:</span>
                          <span className="stat-value">${drillDown.comparisonData.comparison.avgOrderValueQ1.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="quarter-column">
                      <h4>Q{drillDown.comparisonData.quarter2.quarter} {drillDown.comparisonData.quarter2.year}</h4>
                      <div className="quarter-stats">
                        <div className="stat-item">
                          <span className="stat-label">Revenue:</span>
                          <span className="stat-value">${Math.round(drillDown.comparisonData.quarter2.revenue).toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Orders:</span>
                          <span className="stat-value">{drillDown.comparisonData.quarter2.orders}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Avg Order:</span>
                          <span className="stat-value">${drillDown.comparisonData.comparison.avgOrderValueQ2.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};