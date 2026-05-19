import { apiClient } from './apiClient';

export const speciesVariantsApi = {
  getBySpeciesId: (speciesId) => apiClient.get(`/species/${speciesId}/Variants`),
  getById: (speciesId, id) => apiClient.get(`/species/${speciesId}/Variants/${id}`),
  create: (speciesId, data) => apiClient.post(`/species/${speciesId}/Variants`, data),
  update: (speciesId, id, data) => apiClient.put(`/species/${speciesId}/Variants/${id}`, data),
  delete: (speciesId, id) => apiClient.delete(`/species/${speciesId}/Variants/${id}`),
};
