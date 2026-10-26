
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
    (config) => {
        try {
            const responseList = JSON.parse(
                localStorage.getItem("responseList") || "[]"
            );

            const token = responseList[0]?.token;

            if (token) {
                config.headers.Authorization = token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`;
            }
        } catch {
            localStorage.clear();
            window.location.replace("/login");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;
