import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
});

export const apiRequest = async (method, endpoint, data = {}, token = null) => {
    try {
        const isFormData = data instanceof FormData;

        const headers = {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        };

        let response;

        if (method.toUpperCase() === "GET") {
            response = await axiosInstance.get(endpoint, {
                params: data,
                headers,
            });
        } else if (method.toUpperCase() === "POST") {
            response = await axiosInstance.post(endpoint, data, {
                headers,
            });
        } else {
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        return {
            success: true,
            message: response.data.message || "Request successful",
            data: response.data.data || null,
        };
    } catch (error) {
        console.error("❌ API Request Error:", error);

        const message =
            error.response?.data?.message ||
            error.message ||
            "Unexpected error occurred";

        return {
            success: false,
            message,
            data: null,
        };
    }
};
