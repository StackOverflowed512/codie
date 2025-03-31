import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const signup = async (username, email, password) => {
    return axios.post(`${API_URL}/signup`, {
        username,
        email,
        password,
    });
};

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
    });
    if (response.data.access_token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("user");
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};
