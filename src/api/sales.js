import { apiClient } from './apiClient';

export const salesApi = {
  create: (data) => apiClient.post('/Sales', data),
  getAll: (page, pageSize) => apiClient.get('/Sales', { params: { page, pageSize } }),
  getById: (id) => apiClient.get(`/Sales/${id}`),
  getByDateRange: (startDate, endDate) => 
    apiClient.get(`/Sales/by-date-range?startDate=${startDate}&endDate=${endDate}`),
};
