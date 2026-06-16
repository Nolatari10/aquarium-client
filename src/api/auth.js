import { apiClient } from './apiClient';

export const authApi = {
  login: (Email, Password) =>
    apiClient.post('/Auth/login', { Email, Password }),

  registerOwner: (Email, Password, StoreName) =>
    apiClient.post('/Auth/register-owner', { Email, Password, StoreName }),

  registerEmployee: (Email, Password) =>
    apiClient.post('/Auth/register-employee', { Email, Password }),
};
