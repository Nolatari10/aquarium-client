import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5087/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('aquarium_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/Auth/');
            if (!isAuthEndpoint) {
                localStorage.removeItem('aquarium_token');
                localStorage.removeItem('aquarium_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
