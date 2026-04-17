import { apiClient } from './apiClient';

export const catalogApi = {
  getAll: () => apiClient.get('/Catalog'),
};