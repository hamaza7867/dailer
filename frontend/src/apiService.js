import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the Auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (username, password) => {
        const response = await api.post('/login/', { username, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('auth_token');
    }
};

export const voiceService = {
    getTwilioToken: async () => {
        const response = await api.get('/voice-token/');
        return response.data;
    },
    uploadRecording: async (blob, callSid) => {
        const formData = new FormData();
        formData.append('recording', blob, `${callSid}.webm`);
        formData.append('call_sid', callSid);
        const response = await api.post('/upload-recording/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default api;
