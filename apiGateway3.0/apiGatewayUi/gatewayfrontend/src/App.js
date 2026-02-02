import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
//Super-admin related routes
import Layout from "./components/Adminlayout";
import Subadminlayout from "./components/Subadminlayout";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Project from "./pages/Projects";
import ProjectMappingWithRole from "./pages/Userprojectmap";
//Admin related routes
import Admindashboard from "./pages/adminDashboard";
import Adminfileupload from "./pages/adminFileUpload";
import UserManagement from "./pages/Usermanagement";
import FlushDb from "./pages/clearDatabase";
import ProjectEndpoints from "./pages/ProjectEps";
//User related data
import UserLayout from "./components/UserLayout";
import UserDashboard from "./pages/UserDashboard";
import UserAccessApis from "./pages/UserAccessApis";
import UserMappedEps from "./pages/UserMappedEps";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected / Admin Layout Routes */}
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

          {/* Protected / Subadmin Layout Routes */}
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

          {/* Protected / UserLayout Routes */}
          <Route element={<UserLayout />}>
            <Route
              path="/userDashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userMappedEps"
              element={
                <ProtectedRoute>
                  <UserMappedEps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accessEndpoints"
              element={
                <ProtectedRoute>
                  <UserAccessApis />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
