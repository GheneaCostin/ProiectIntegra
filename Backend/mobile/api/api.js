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
    const params = { userId1, userId2 };
    const headers = { 'Authorization': `Bearer ${token}` };


    const urlStandard = `${BASE_ROOT}/messages/history`;


    const urlWithApi = `${BASE_ROOT}/api/messages/history`;

    console.log(`[Mobile API] Fetching Chat History...`);

    try {
        console.log(`[Mobile API] Trying URL: ${urlStandard}`);
        const response = await axios.get(urlStandard, { params, headers });
        console.log(`[Mobile API] Success on standard URL!`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`[Mobile API] 404 on standard URL. Trying fallback: ${urlWithApi}`);
            try {
                const responseFallback = await axios.get(urlWithApi, { params, headers });
                console.log(`[Mobile API] Success on fallback URL!`);
                return responseFallback.data;
            } catch (fallbackError) {
                console.error(`[Mobile API] Failed on fallback URL too.`);
                throw fallbackError;
            }
        }
        console.error(`[Mobile API] Error fetching history:`, error.message);
        throw error;
    }
};

export default apiClient;