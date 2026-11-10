import axios from "axios";

export const api = axios.create({
    baseURL: "/",
});

// in-memory auth header
export function setAuthToken(token) {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
}

// If the token expired / was rejected, let the app log out cleanly.
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        if (status === 401 && !url.includes("/api/auth/")) {
            window.dispatchEvent(new Event("hb:unauthorized"));
        }
        return Promise.reject(error);
    }
);
