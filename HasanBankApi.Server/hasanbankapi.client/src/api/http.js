import axios from "axios";

export const api = axios.create({
    baseURL: "/",
});

// in-memory auth header
export function setAuthToken(token) {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
}