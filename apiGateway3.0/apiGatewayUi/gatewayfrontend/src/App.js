import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Adminlayout";
import Subadminlayout from "./components/Subadminlayout";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Project from "./pages/Projects";
import ProjectMappingWithRole from "./pages/Userprojectmap";
import Admindashboard from "./pages/adminDashboard";
import Adminfileupload from "./pages/adminFileUpload";
import UserManagement from "./pages/Usermanagement";
import FlushDb from "./pages/clearDatabase";
import ProjectEndpoints from "./pages/ProjectEps";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected / Layout Routes */}
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/userManagement" element={<UserManagement />} />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Project />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userProject"
              element={
                <ProtectedRoute>
                  <ProjectMappingWithRole />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Protected / Layout Routes */}
          <Route element={<Subadminlayout />}>
            <Route
              path="/adminDashboard"
              element={
                <ProtectedRoute>
                  <Admindashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminFileUpload"
              element={
                <ProtectedRoute>
                  <Adminfileupload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flushDb"
              element={
                <ProtectedRoute>
                  <FlushDb />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projectEndPoints"
              element={
                <ProtectedRoute>
                  <ProjectEndpoints />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
