import { apiClient } from './apiClient';

export const speciesApi = {
  getAll: (page, pageSize) => apiClient.get('/Species', { params: { page, pageSize } }),
  getById: (id) => apiClient.get(`/Species/${id}`),
  create: (data) => apiClient.post('/Species', data),
  update: (id, data) => apiClient.put(`/Species/${id}`, data),
  delete: (id) => apiClient.delete(`/Species/${id}`),
  bulkImport: (species) => apiClient.post('/Species/bulk-import', { Species: species }, { timeout: 120000 }),
  bulkDelete: (ids) => apiClient.post('/Species/batch-delete', { Ids: ids }),
};