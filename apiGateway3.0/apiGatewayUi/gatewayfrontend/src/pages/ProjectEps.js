import React, { useState, useEffect, useContext } from "react";
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
  Box,
} from "@mui/material";
import {
  getEpsMappedToProjects,
  getProjectsMappedToUser,
} from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

const cellStyle = {
  maxWidth: 180,
  whiteSpace: "normal",
  wordBreak: "break-word",
  fontSize: "0.85rem",
  verticalAlign: "top",
};

const scrollBox = {
  maxHeight: 120,
  overflowY: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  lineHeight: 1.4,
  border: "1px solid #e0e0e0",
  borderRadius: 1,
  padding: 1,
  backgroundColor: "#ffffff",
};

const ProjectEndpoints = () => {
  const { user } = useContext(AuthContext);

  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [endpoints, setEndpoints] = useState([]);

  /* ---------------- FETCH MAPPED PROJECTS ---------------- */

  useEffect(() => {
    if (!user?.userId) return;

    const fetchMappedProjects = async () => {
      try {
        const res = await getProjectsMappedToUser({ userId: user.userId });
        setMappedProjects(res.data.responseObject || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMappedProjects();
  }, [user]);

  /* ---------------- FETCH ENDPOINTS ---------------- */

  useEffect(() => {
    if (!selectedProject) return;

    const fetchEndpoints = async () => {
      try {
        const res = await getEpsMappedToProjects({
          projectCode: selectedProject,
        });
        setEndpoints(res.data.responseObject || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEndpoints();
  }, [selectedProject]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        Project Endpoints
      </Typography>

      {/* PROJECT SELECT */}
      <Box sx={{ maxWidth: 320, mb: 3 }}>
        <TextField
          select
          label="Select Project"
          size="small"
          fullWidth
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {mappedProjects.map((project) => (
            <MenuItem key={project.projectId} value={project.projectCode}>
              {project.projectName}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* ENDPOINT TABLE */}
      {selectedProject && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  "Endpoint",
                  "Token",
                  "Project Code",
                  "Request Type",
                  "Sample Request",
                  "Description",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      textAlign: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {endpoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No endpoints available for this project
                  </TableCell>
                </TableRow>
              ) : (
                endpoints.map((ep, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      "&:hover": { backgroundColor: "#f9fafb" },
                    }}
                  >
                    {/* Endpoint */}
                    <TableCell sx={cellStyle}>
                      <Box sx={cellStyle}>{ep.endPoint}</Box>
                    </TableCell>

                    {/* Token */}
                    <TableCell sx={cellStyle}>
                      <Box sx={cellStyle}>{ep.endPointToken}</Box>
                    </TableCell>

                    {/* Project Code */}
                    <TableCell sx={cellStyle}>
                      <Box sx={cellStyle}>{ep.projectCode}</Box>
                    </TableCell>

                    {/* Request Type */}
                    <TableCell sx={cellStyle}>
                      <Box sx={cellStyle}>{ep.requestType}</Box>
                    </TableCell>

                    {/* Sample Request */}
                    <TableCell sx={{ maxWidth: 360, p: 1 }}>
                      <Box sx={scrollBox}>{ep.sampleRequestSchema || "-"}</Box>
                    </TableCell>

                    {/* Description */}
                    <TableCell sx={cellStyle}>
                      <Box sx={cellStyle}>{ep.description || "-"}</Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProjectEndpoints;
