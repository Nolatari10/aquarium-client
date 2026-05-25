import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';
import { authApi } from '../api/auth';

const TOKEN_KEY = 'aquarium_token';
const USER_KEY = 'aquarium_user';

function loadStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
  } catch {
    // corrupted storage, clear it
  }
  return { token: null, user: null };
}

function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      const token = response.data.Token;
      const user = {
        userId: response.data.UserId,
        email: response.data.Email,
        role: response.data.Role,
        tenantName : response.data.TenantName
      };
      saveAuth(token, user);
      setAuth({ token, user });
      navigate('/', { replace: true });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    clearAuth();
    setAuth({ token: null, user: null });
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    token: auth.token,
    user: auth.user,
    isAuthenticated: !!auth.token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
