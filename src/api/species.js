import { apiClient } from './apiClient';

export const speciesApi = {
  getAll: () => apiClient.get('/Species'),
  getById: (id) => apiClient.get(`/Species/${id}`),
  create: (data) => apiClient.post('/Species', data),
  update: (id, data) => apiClient.put(`/Species/${id}`, data),
  delete: (id) => apiClient.delete(`/Species/${id}`),
};