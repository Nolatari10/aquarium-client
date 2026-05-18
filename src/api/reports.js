import { apiClient } from './apiClient';

export const reportsApi = {
  getStockReport: () => apiClient.get('/Reports/stock'),
  getMortalityReport: (params) => apiClient.get('/Reports/mortality', { params }),
  getSalesReport: (startDate, endDate, page, pageSize) =>
    apiClient.get('/Reports/sales', { params: { startDate, endDate, page, pageSize } }),
  getInventoryValuation: () => apiClient.get('/Reports/valuation'),
  getSupplierPerformance: (params) => apiClient.get('/Reports/supplier-performance', { params }),
  getInventoryTurnover: (params) => apiClient.get('/Reports/inventory-turnover', { params }),
};