import { apiClient } from './apiClient';

export const tanksApi = {
  getAll: (params) => apiClient.get('/Tanks', { params }),
  getById: (id) => apiClient.get(`/Tanks/${id}`),
  create: (data) => apiClient.post('/Tanks', data),
  update: (id, data) => apiClient.put(`/Tanks/${id}`, data),
  delete: (id) => apiClient.delete(`/Tanks/${id}`),

  getWaterParameters: (id, params) => apiClient.get(`/Tanks/${id}/water-parameters`, { params }),
  addWaterParameter: (id, data) => apiClient.post(`/Tanks/${id}/water-parameters`, data),

  getMaintenance: (id, params) => apiClient.get(`/Tanks/${id}/maintenance`, { params }),
  addMaintenance: (id, data) => apiClient.post(`/Tanks/${id}/maintenance`, data),

  getFertilization: (id, params) => apiClient.get(`/Tanks/${id}/fertilization`, { params }),
  addFertilization: (id, data) => apiClient.post(`/Tanks/${id}/fertilization`, data),

  getPhotos: (id, params) => apiClient.get(`/Tanks/${id}/photos`, { params }),
  addPhoto: (id, data) => apiClient.post(`/Tanks/${id}/photos`, data),
  deletePhoto: (photoId) => apiClient.delete(`/Tanks/photos/${photoId}`),

  getTrends: (id, params) => apiClient.get(`/Tanks/${id}/trends`, { params }),
  getTimeline: (id, params) => apiClient.get(`/Tanks/${id}/timeline`, { params }),

  getTargetRanges: (id) => apiClient.get(`/Tanks/${id}/target-ranges`),
  upsertTargetRanges: (id, data) => apiClient.put(`/Tanks/${id}/target-ranges`, data),
};
