import axios from "axios";


const API_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});


axiosInstance.interceptors.request.use(config => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const getPatients = async () => {
    const response = await axiosInstance.get("/doctor/patients");
    return response.data;
};

export const prescribeTreatment = async (treatmentData) => {
    const response = await axiosInstance.post("/doctor/addTreatment", treatmentData);
    return response.data;
};

export const getTreatmentsByDoctor = async (doctorId) => {
    const response = await axiosInstance.get(`/doctor/treatments/${doctorId}`);
    return response.data;
};