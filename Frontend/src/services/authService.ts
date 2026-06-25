import apiClient from './apiClient';
import type { LoginData, RegisterData, AuthResponse } from '../types/auth';

const authService = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('username', data.email);
        formData.append('password', data.password);

        const response = await apiClient.post('/auth/login/access-token', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

export default authService;
