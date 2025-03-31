import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getProblems = () => {
    return axios.get(`${API_URL}/problems`);
};

export const getProblemById = (id) => {
    return axios.get(`${API_URL}/problems/${id}`);
};
