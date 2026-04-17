import { apiClient } from './apiClient';

export const reportsApi = {
  getStockReport: () => apiClient.get('/Reports/stock'),
  getMortalityReport: (params) => apiClient.get('/Reports/mortality', { params }),
  getSalesReport: (startDate, endDate) => 
    apiClient.get(`/Reports/sales?startDate=${startDate}&endDate=${endDate}`),
  getInventoryValuation: () => apiClient.get('/Reports/valuation'),
};