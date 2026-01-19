import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";
import { getProjectList, getEpsMappedToProjects } from "../api/authApi";

const ProjectEndpoints = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [endpoints, setEndpoints] = useState([]);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjectList();
        console.log(res.data);
        setProjects(res.data.responseObject.projects || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch endpoints when project is selected
  useEffect(() => {
    if (!selectedProject) return;

    const fetchEndpoints = async () => {
      try {
        const res = await getEpsMappedToProjects(selectedProject);
        setEndpoints(res.data.responseObject.endPoints || []);
      } catch (err) {
        console.error("Failed to fetch project endpoints", err);
      }
    };

    fetchEndpoints();
  }, [selectedProject]);

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" mb={3}>
        Project Endpoints
      </Typography>

      {/* Project Selector */}
      <div style={{ maxWidth: 320, marginBottom: 24 }}>
        <TextField
          select
          label="Select Project"
          size="small"
          fullWidth
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {projects.map((project) => (
            <MenuItem key={project.projectId} value={project.projectCode}>
              {project.projectName}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Endpoints Table */}
      {selectedProject && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Endpoint</TableCell>
                <TableCell>Token</TableCell>
                <TableCell>Project Code</TableCell>
                <TableCell>Request Type</TableCell>
                <TableCell>Sample Request</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpoints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No endpoints available for this project
                  </TableCell>
                </TableRow>
              )}
              {endpoints.map((ep, idx) => (
                <TableRow key={idx}>
                  <TableCell>{ep.endPoint}</TableCell>
                  <TableCell>{ep.endPointToken}</TableCell>
                  <TableCell>{ep.projectCode}</TableCell>
                  <TableCell>{ep.requestType}</TableCell>
                  <TableCell>
                    <pre style={{ margin: 0 }}>
                      {ep.sampleRequestSchema || "-"}
                    </pre>
                  </TableCell>
                  <TableCell>{ep.description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ProjectEndpoints;
