import React from 'react';
import { Product } from '../types/index';

interface ProductFilterProps {
  products: Product[];
  selectedProductId: number | null;
  selectedProductName: string;
  chartsLoading: boolean;
  onProductChange: (productId: number | null, productName: string) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  products,
  selectedProductId,
  selectedProductName,
  chartsLoading,
  onProductChange
}) => {
  return (
    <div className="product-filter-section">
      <div className="product-filter-card">
        <h3>🛍️ Product Analysis</h3>
        <div className="product-controls">
          <div className="product-selector">
            <label>Analyze Product:</label>
            <select
              value={selectedProductId || 'all'}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  onProductChange(null, 'All Products');
                } else {
                  const productId = parseInt(value);
                  const product = products.find(p => p.product_id === productId);
                  onProductChange(productId, product?.product_name || 'Unknown Product');
                }
              }}
              disabled={chartsLoading}
            >
              <option value="all">All Products</option>
              {products.map(product => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>
          <div className="current-product">
            Charts showing: <strong>{selectedProductName}</strong>
            {chartsLoading && <span className="loading-indicator">Updating charts...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};