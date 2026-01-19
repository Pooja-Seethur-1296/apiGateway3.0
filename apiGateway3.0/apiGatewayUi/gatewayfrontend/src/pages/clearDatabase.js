import React, { useState, useContext, useEffect } from "react";
import { TextField, Button, Stack, MenuItem } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { getUserList, getProjectList, userProjectMap } from "../api/authApi";

const FlushDb = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userRole: "",
  });
  const [projects, setProjects] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.userName,
        email: user.email || "",
        userRole: user.userRole,
      });
      fetchMappedProjects();
      fetchCounts();
    }
  }, [user]);

  const fetchMappedProjects = async () => {
    try {
      const res = await userProjectMap(user.userId);
      setMappedProjects(res.data.responseObject.projects);
    } catch (err) {
      console.error("Failed to fetch mapped projects", err);
    }
  };

  const fetchCounts = async () => {
    try {
      const usersRes = await getUserList();
      setUsersCount(usersRes.data.responseObject.users.length);

      const projectsRes = await getProjectList();
      setProjectsCount(projectsRes.data.responseObject.projects.length);
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  return (
    <>
      {/* Project Selector */}
      <div style={{ maxWidth: 320, marginBottom: 24 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Select Project"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {mappedProjects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <TextField
        label="Enter project admin secret key"
        name="name"
        onChange={handleChange}
        size="small"
      />
    </>
  );
};

const styles = {};

export default FlushDb;
