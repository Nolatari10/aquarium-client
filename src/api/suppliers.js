import { apiClient } from './apiClient';

export const suppliersApi = {
  getAll: () => apiClient.get('/Suppliers'),
  getById: (id) => apiClient.get(`/Suppliers/${id}`),
  create: (data) => apiClient.post('/Suppliers', data),
  update: (id, data) => apiClient.put(`/Suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/Suppliers/${id}`),
};