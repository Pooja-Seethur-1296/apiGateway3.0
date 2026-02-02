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
  maxWidth: 200,
  fontSize: "0.85rem",
  verticalAlign: "top",
};

const codeBox = {
  maxHeight: 140,
  overflowY: "auto",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  lineHeight: 1.4,
  border: "1px solid #e5e7eb",
  borderRadius: 1,
  padding: 1,
  backgroundColor: "#0f172a",
  color: "#e5e7eb",
  whiteSpace: "pre-wrap",
};

const methodColor = (method) => {
  switch (method) {
    case "GET":
      return { bg: "#e3f2fd", color: "#1565c0" };
    case "POST":
      return { bg: "#e8f5e9", color: "#2e7d32" };
    case "PUT":
      return { bg: "#fff3e0", color: "#ef6c00" };
    case "DELETE":
      return { bg: "#ffebee", color: "#c62828" };
    default:
      return { bg: "#f3f4f6", color: "#374151" };
  }
};

const UserMappedEps = () => {
  const { user } = useContext(AuthContext);
  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [endpoints, setEndpoints] = useState([]);

  /* ---------------- FETCH PROJECTS ---------------- */

  useEffect(() => {
    if (!user?.userId) return;

    const fetchMappedProjects = async () => {
      const res = await getProjectsMappedToUser({ userId: user.userId });
      setMappedProjects(res.data.responseObject || []);
    };

    fetchMappedProjects();
  }, [user]);

  /* ---------------- FETCH ENDPOINTS ---------------- */

  useEffect(() => {
    if (!selectedProject) return;

    const fetchEndpoints = async () => {
      const res = await getEpsMappedToProjects({
        projectCode: selectedProject,
      });
      setEndpoints(res.data.responseObject || []);
    };

    fetchEndpoints();
  }, [selectedProject]);

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h5" mb={3}>
        Project Endpoints
      </Typography>

      {/* PROJECT SELECT */}
      <Box sx={{ maxWidth: 360, mb: 3 }}>
        <TextField
          select
          label="Select Project"
          size="small"
          fullWidth
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {mappedProjects.map((p) => (
            <MenuItem key={p.projectId} value={p.projectCode}>
              {p.projectName}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* ENDPOINT TABLE */}
      {selectedProject && (
        <Paper elevation={1}>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    "Endpoint",
                    "Method",
                    "Token",
                    "Project",
                    "Sample Request",
                    "Description",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#f8fafc",
                        fontSize: "0.8rem",
                      }}
                    >
                      {h}
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
                  endpoints.map((ep, idx) => {
                    const color = methodColor(ep.requestType);

                    return (
                      <TableRow
                        key={idx}
                        hover
                        sx={{
                          backgroundColor:
                            idx % 2 === 0 ? "#fafafa" : "inherit",
                        }}
                      >
                        {/* Endpoint */}
                        <TableCell sx={cellStyle}>
                          <Box
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              wordBreak: "break-all",
                            }}
                          >
                            {ep.endPoint}
                          </Box>
                        </TableCell>

                        {/* Method */}
                        <TableCell sx={cellStyle}>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1,
                              py: 0.3,
                              borderRadius: 1,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              backgroundColor: color.bg,
                              color: color.color,
                            }}
                          >
                            {ep.requestType}
                          </Box>
                        </TableCell>

                        {/* Token */}
                        <TableCell sx={cellStyle}>
                          <Typography
                            variant="caption"
                            sx={{ wordBreak: "break-all" }}
                          >
                            {ep.endPointToken}
                          </Typography>
                        </TableCell>

                        {/* Project */}
                        <TableCell sx={cellStyle}>{ep.projectCode}</TableCell>

                        {/* Sample Request */}
                        <TableCell sx={{ minWidth: 360 }}>
                          <Box sx={codeBox}>
                            {ep.sampleRequestSchema || "-"}
                          </Box>
                        </TableCell>

                        {/* Description */}
                        <TableCell sx={cellStyle}>
                          {ep.description || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default UserMappedEps;
