import axios from 'axios';


const API_URL = 'http://192.168.0.102:8080/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (data) => {
    try {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    } catch (error) {
        console.log("API Error:", error);
        throw error;
    }
};

export const register = async (data) => {
    try {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    } catch (error) {
        console.log("Register API Error:", error);
        throw error;
    }
};

export default apiClient;