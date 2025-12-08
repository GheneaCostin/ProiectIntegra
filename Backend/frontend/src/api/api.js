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


export const updateTreatment = async (id, treatmentData) => {
    const response = await axiosInstance.put(`treatments/${id}`, treatmentData);
    return response.data;
};

export const deleteTreatment = async (id) => {
    const response = await axiosInstance.delete(`treatments/${id}`);
    return response.data;
};


export const getTreatmentsByDoctor = async (doctorId, page,  size , search = "", filter = "All") => {

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);

    if (search) {
        params.append("search", search);
    }

    if (filter && filter !== "All") {
        params.append("filter", filter);
    }

    const response = await axiosInstance.get(`/doctor/treatments/${doctorId}?${params.toString()}`);
    return response.data;
};