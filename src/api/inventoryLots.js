import { apiClient } from './apiClient';

export const inventoryLotsApi = {
  getAll: (page, pageSize) => apiClient.get('/InventoryLots', { params: { page, pageSize } }),
  getById: (id) => apiClient.get(`/InventoryLots/${id}`),
  create: (data) => apiClient.post('/InventoryLots', data),
  registerMortality: (data) => apiClient.post('/InventoryLots/register-mortality', data),
  getBySpecies: (speciesId) => apiClient.get(`/InventoryLots/by-species/${speciesId}`),
  getBiologicalStock: (lotId) => apiClient.get(`/InventoryLots/biological-stock/${lotId}`),
};
