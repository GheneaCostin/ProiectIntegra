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

export const createExport = async (exportBody) => {
    try {
        const response = await axiosInstance.post(
            "/treatments/export",
            exportBody,
            {
                responseType: "arraybuffer",
            }
        );

        const pdfBlob = new Blob([response.data], {type: "application/pdf"});
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "prescriptions.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();


    } catch (error) {
        console.error("Export PDF error:", error);
        throw error;
    }


};

export const getChatHistory = async (userId1, userId2) => {
    try {
        const response = await axiosInstance.get(`/messages/history`, {
            params: { userId1, userId2 }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
};