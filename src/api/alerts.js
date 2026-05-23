import { apiClient } from './apiClient';

export const alertsApi = {
  getActiveHighMortalityAlerts: () => apiClient.get('/AlertConfigs/high-mortality-alerts'),
  getConfigs: () => apiClient.get('/AlertConfigs'),
  getConfigByType: (alertType) => apiClient.get(`/AlertConfigs/${alertType}`),
  updateConfig: (id, data) => apiClient.put(`/AlertConfigs/${id}`, data),
};
