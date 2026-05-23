import { apiClient } from './apiClient';
import { authApi } from './auth';

export const usersApi = {
  getAll: () => apiClient.get('/Users'),
  delete: (id) => apiClient.delete(`/Users/${id}`),
  registerEmployee: (email, password) =>
    authApi.registerEmployee(email, password),
  changePassword: (currentPassword, newPassword) =>
    apiClient.put('/Auth/change-password', { CurrentPassword: currentPassword, NewPassword: newPassword }),
};
