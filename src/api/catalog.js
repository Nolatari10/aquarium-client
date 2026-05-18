import { apiClient } from './apiClient';

export const catalogApi = {
  getAll: (page, pageSize) => apiClient.get('/Catalog', { params: { page, pageSize } }),
};