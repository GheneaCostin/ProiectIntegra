import axios from 'axios';

const BASE_ROOT = 'http://192.168.1.100:8080';
const API_URL = `${BASE_ROOT}/api`;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (data) => {
    try {
        console.log(`[Mobile API] Login Request to: ${API_URL}/auth/login`);
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

export const exportTreatmentsPdf = async (exportDto, token) => {
    return apiClient.post(
        "/treatments/export",
        exportDto,
        {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: "arraybuffer",
        }
    );
};

export const getChatHistory = async (userId1, userId2, token) => {
    const targetUrl = `${BASE_ROOT}/messages/history`;
    try {
        const response = await axios.get(targetUrl, {
            params: { userId1, userId2 },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {

        try {
            const response2 = await axios.get(`${BASE_ROOT}/api/messages/history`, {
                params: { userId1, userId2 },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response2.data;
        } catch (e) {
            console.error("Error fetching history:", error);
            throw error;
        }
    }
};

export const getUserConversations = async (userId, token) => {

    const targetUrl = `${BASE_ROOT}/messages/conversations/${userId}`;
    try {
        const response = await axios.get(targetUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {

        try {
            console.log("Retrying conversations on /api/messages...");
            const response2 = await axios.get(`${BASE_ROOT}/api/messages/conversations/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response2.data;
        } catch (e) {
            console.error("Error fetching conversations:", error);
            throw error;
        }
    }
};

export const getDoctorsList = async (token) => {

    const targetUrl = `${BASE_ROOT}/api/users/doctors`;
    try {
        const response = await axios.get(targetUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {

        try {
            const response2 = await axios.get(`${BASE_ROOT}/users/doctors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response2.data;
        } catch (e) {
            console.error("Error fetching doctors:", error);
            throw error;
        }
    }
};

export const markMessagesAsRead = async (senderId, receiverId, token) => {

    const targetUrl = `${BASE_ROOT}/messages/read`;
    try {
        await axios.post(targetUrl,
            { senderId, receiverId },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
    } catch (error) {
        try {
            await axios.post(`${BASE_ROOT}/api/messages/read`,
                { senderId, receiverId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch(e) {
            console.error("Error marking messages as read:", e);

        }
    }
};

export default apiClient;