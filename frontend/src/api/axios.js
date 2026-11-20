import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;
const localBaseURL = "http://127.0.0.1:8000";
const baseURL = configuredBaseURL || (
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? localBaseURL
        : ""
);

const api = axios.create({
    baseURL,
    headers: {"Content-Type": "application/json"},
});


// Attach JWT token to every request
api.interceptors.request.use((config)=> {
    const token = localStorage.getItem("access_token");

    if (token) 
        config.headers.Authorization = `Bearer ${token}`;
    
    return config;
});


// Redirect to login on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(err)
    }
);

export default api;