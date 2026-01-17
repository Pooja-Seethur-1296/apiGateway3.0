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
export const getUserList = () => API.get("/user/getList");
//project related APIs
export const addProject = (data) => API.post("/project/addProject", data);
export const deleteProject = (data) => API.post("/project/deleteProject", data);
export const getProjectList = () => API.get("/project/getProjectList");
export const getProjectDetails = (data) =>
  API.post("/project/getProjectDetails", data);
export const modifyProject = (data) => API.post("/project/modifyProject", data);
//Mapping assignment
export const userProjectMap = (data) =>
  API.post("/userProjectMap/mapProjectsToUser", data);
export const userProjectModifyMap = (data) =>
  API.post("/userProjectMap/modifyProjectsOfUser", data);
export default API;
