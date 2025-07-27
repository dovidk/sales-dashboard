import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://YOUR_API_DOMAIN.railway.app/api/Sales'
  : 'http://localhost:5117/api/Sales';

export const salesApi = {
  getTotalOrders: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return axios.get(`${BASE_URL}/total-orders?${params.toString()}`);
  },
  getTotalRevenue: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return axios.get(`${BASE_URL}/total-revenue?${params.toString()}`);
  },
  getAverageOrderValue: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return axios.get(`${BASE_URL}/avg-order-value?${params.toString()}`);
  },
  getOrdersByMonth: (productId?: number) => {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId.toString());
    return axios.get(`${BASE_URL}/orders-by-month?${params.toString()}`);
  },
  getTopCustomers: () => axios.get(`${BASE_URL}/top-customers`),
  getQuarterlyGrowth: (productId?: number) => {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId.toString());
    return axios.get(`${BASE_URL}/quarterly-growth?${params.toString()}`);
  },
  getCustomerOrders: (customerId: string) => axios.get(`${BASE_URL}/customer-orders/${customerId}`),
  compareQuarters: (quarter1: number, year1: number, quarter2: number, year2: number) =>
    axios.get(`${BASE_URL}/compare-quarters?quarter1=${quarter1}&year1=${year1}&quarter2=${quarter2}&year2=${year2}`),
  getProductsList: () => axios.get(`${BASE_URL}/products-list`)
};