import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const loginUser = (data) => API.post("/user/login", data);
export const registerUser = (data) => API.post("/user/add", data);

export default API;
