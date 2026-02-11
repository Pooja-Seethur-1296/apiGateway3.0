import axios from "axios";

const API = axios.create({
  baseURL: "http://testserv.ortusolis.in:5492",
});

const adminAPI = axios.create({
  baseURL: "http://testserv.ortusolis.in:5494",
});

const userAPI = axios.create({
  baseURL: "http://testserv.ortusolis.in:5496",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // redirect to login
      alert("Session expired. Please login again.");
    }
    return Promise.reject(error);
  },
);
// Attach token automatically
adminAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // redirect to login
      alert("Session expired. Please login again.");
    }
    return Promise.reject(error);
  },
);

// Attach token automatically
userAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // redirect to login
      alert("Session expired. Please login again.");
    }
    return Promise.reject(error);
  },
);
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
export const getAPIAccessStatistics = (data) =>
  adminAPI.post("/getApiAccessCount", data);
export const allAPIAccessPerAdmin = (data) =>
  adminAPI.post("/getApiCountForAllProjects", data);

//User functionalities
//redundant
export const externalLogin = (data) => {};

export const reRoute = (data) => userAPI.post("/reRoute", data);
export default API;
