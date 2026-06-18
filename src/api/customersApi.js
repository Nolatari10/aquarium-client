import { apiClient } from './apiClient';

export const customersApi = {
  getAll: () => apiClient.get('/Customers'),
  getById: (id) => apiClient.get(`/Customers/${id}`),
  getByType: (type) => apiClient.get(`/Customers/by-type/${type}`),
  create: (data) => apiClient.post('/Customers', data),
  update: (id, data) => apiClient.put(`/Customers/${id}`, data),
  delete: (id) => apiClient.delete(`/Customers/${id}`),
};
