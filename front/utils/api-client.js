const axios = require('axios');
const config = require('../config/app-config');

class ApiClient {
    constructor() {
        this.client = axios.create({
            baseURL: config.api.baseURL,
            timeout: config.api.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        this.client.interceptors.request.use(
            (config) => {
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                
                console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log(`API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('API Error:', {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    url: error.config?.url
                });

                if (error.response?.status === 401) {
                    this.clearAuthToken();
                }

                return Promise.reject(this.formatError(error));
            }
        );
    }

    setAuthToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
        }
    }

    getAuthToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    }

    clearAuthToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
    }

    formatError(error) {
        return {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
            details: error.response?.data?.details || null
        };
    }

    async getUsers(page = 0, size = 10) {
        const response = await this.client.get('/users', {
            params: { page, size }
        });
        return response.data;
    }

    async getUserById(id) {
        const response = await this.client.get(`/users/${id}`);
        return response.data;
    }

    async createUser(userData) {
        const response = await this.client.post('/users', userData);
        return response.data;
    }

    async updateUser(id, userData) {
        const response = await this.client.put(`/users/${id}`, userData);
        return response.data;
    }

    async deleteUser(id) {
        const response = await this.client.delete(`/users/${id}`);
        return response.data;
    }

    async login(credentials) {
        const response = await this.client.post('/auth/login', credentials);
        const { token } = response.data;
        
        if (token) {
            this.setAuthToken(token);
        }
        
        return response.data;
    }

    async logout() {
        try {
            await this.client.post('/auth/logout');
        } catch (error) {
            console.warn('Logout API call failed:', error.message);
        } finally {
            this.clearAuthToken();
        }
    }

    async register(userData) {
        const response = await this.client.post('/auth/register', userData);
        return response.data;
    }

    async healthCheck() {
        const response = await this.client.get('/health');
        return response.data;
    }
}

const apiClient = new ApiClient();

module.exports = apiClient;
