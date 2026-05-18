import { apiClient } from './apiClient';

export const fertilizerPresetsApi = {
  getAll: () => apiClient.get('/FertilizerPresets'),
  create: (data) => apiClient.post('/FertilizerPresets', data),
  update: (id, data) => apiClient.put(`/FertilizerPresets/${id}`, data),
  delete: (id) => apiClient.delete(`/FertilizerPresets/${id}`),
};
