import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001",
});

const adminAPI = axios.create({
  baseURL: "http://localhost:2001",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Attach token automatically
adminAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

//Super Admin functionalities

export const loginUser = (data) => API.post("/user/login", data);
export const registerUser = (data) => API.post("/user/add", data);
export const deleteUser = (data) => API.post("/user/delete", data);
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
export const getProjectsMappedToUser = (data) =>
  API.post("/userProjectMap/getProjectsOfUser", data);

//Admin functionalities
export const getEpsMappedToProjects = (data) =>
  adminAPI.post("/getEndpointsOfProjects", data);
export const uploadFile = (formData, config = {}) => {
  // Return the axios promise so that caller can await it
  return adminAPI.post("/uploadFile", formData, {
    ...config, // allows onUploadProgress or extra headers
  });
};
export const mapUserProjectEps = (data) =>
  adminAPI.post("/mapUserEndPoints", data);
export const flushDatabase = (data) => adminAPI.post("/flushRedis", data);
export default API;
