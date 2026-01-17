import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  addProject,
  deleteProject,
  getProjectDetails,
  modifyProject,
  getProjectList,
} from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

// Dummy initial projects
const initialProjects = [];

const Project = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [openModal, setOpenModal] = useState(false);
  const { user, logout, updateUser } = useContext(AuthContext);
  const [currentProject, setCurrentProject] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await getProjectList(); // ✅ CALL the function
      //setProjects(response.data.responseObject.projects); // ✅ use response.data
      const normalizedProjects = response.data.responseObject.projects.map(
        (p) => ({
          id: p.projectId,
          name: p.projectName,
          code: p.projectCode,
          description: p.description,
        })
      );

      setProjects(normalizedProjects);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };
  const [editingId, setEditingId] = useState(null);

  // Open modal for add/edit
  const handleOpenModal = (project = null) => {
    if (project) {
      console.log("Project is present to edit");
      setCurrentProject(project);
      setEditingId(project.code);
    } else {
      setCurrentProject({ name: "", description: "", code: "" });
      setEditingId(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  // Add or Update project
  const handleSaveProject = async () => {
    if (!currentProject.name) return;

    if (editingId) {
      console.log(editingId);
      console.log("came to edit project");
      // Update
      try {
        let modifiedOne = await modifyProject({
          projectCode: currentProject.code,
          description: currentProject.description,
          userId: user.userId,
        });

        console.log("added " + JSON.stringify(modifiedOne.data.responseObject));
        //Iterate through fetched Data and feed
        let cleanedData = modifiedOne.data.responseObject;
        setProjects([
          ...projects,
          {
            id: cleanedData.projectId,
            name: cleanedData.projectName,
            code: cleanedData.projectCode,
            description: cleanedData.description,
          },
        ]);
      } catch (err) {
        console.log("error in modifying the project");
      }
      // setProjects((prev) =>
      //   prev.map((p) => (p.id === editingId ? { ...p, ...currentProject } : p))
      // );
    } else {
      // Add
      try {
        let addedOne = await addProject({
          projectName: currentProject.name,
          projectCode: currentProject.code,
          description: currentProject.description,
          userId: user.userId,
        });

        console.log("added " + JSON.stringify(addedOne.data.responseObject));
        //Iterate through fetched Data and feed
        let cleanedData = addedOne.data.responseObject;
        setProjects([
          ...projects,
          {
            id: cleanedData.projectId,
            name: cleanedData.projectName,
            code: cleanedData.projectCode,
            description: cleanedData.description,
          },
        ]);
      } catch (err) {
        console.log("error in addition of project");
      }
    }
    handleCloseModal();
  };

  // Delete project
  const handleDeleteProject = async (code) => {
    console.log(code);
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        console.log("Came here");
        let deletedOne = await deleteProject({
          projectCode: code,
          userId: user.userId,
        });

        console.log(deletedOne.data);
        console.log("deleted " + JSON.stringify(deletedOne.data.responseCode));
        //Iterate through fetched Data and feed
        if (deletedOne.data.responseCode === 200) {
          setProjects((prev) => prev.filter((p) => p.code !== code));
        }
      } catch (err) {
        console.log("Error in deleting project");
      }
      // setProjects(projects.filter((p) => p.id !== id));
    }
  };

  return (
    <Box sx={{ p: 4, fontFamily: "Inter, sans-serif" }}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Project Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal()}
        sx={{ mb: 2 }}
      >
        + Add New Project
      </Button>

      {/* Projects Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f4f6f8" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Project Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>{project.code}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenModal(project)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteProject(project.code)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No projects available to show
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Project Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit Project" : "Add New Project"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            fullWidth
            sx={{ mt: 2 }}
            value={currentProject.name}
            onChange={(e) =>
              setCurrentProject({ ...currentProject, name: e.target.value })
            }
          />
          <TextField
            label="Project Code"
            fullWidth
            sx={{ mt: 2 }}
            disabled={Boolean(editingId)}
            value={currentProject.code}
            onChange={(e) =>
              setCurrentProject({ ...currentProject, code: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            sx={{ mt: 2 }}
            value={currentProject.description}
            onChange={(e) =>
              setCurrentProject({
                ...currentProject,
                description: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProject}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Project;
