import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  LinearProgress,
  Stack,
  Divider,
} from "@mui/material";
import { FaFileExcel } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import {
  getProjectsMappedToUser,
  uploadFile,
  mapUserProjectEps,
} from "../api/authApi";

const AdminFileUpload = () => {
  const { user } = useContext(AuthContext);

  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [loadingMap, setLoadingMap] = useState(false);

  /* ---------------- FETCH PROJECTS ---------------- */

  useEffect(() => {
    if (user?.userId) fetchMappedProjects();
  }, [user]);

  const fetchMappedProjects = async () => {
    const res = await getProjectsMappedToUser({ userId: user.userId });
    setMappedProjects(res.data.responseObject || []);
  };

  /* ---------------- FILE HANDLING ---------------- */

  const handleFileSelect = (file) => {
    if (!file) return;

    const valid =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (!valid) {
      setMessage("Only Excel files (.xls, .xlsx) allowed");
      return;
    }

    setFile(file);
    setMessage("");
    setProgress(0);
  };

  /* ---------------- UPLOAD ---------------- */

  const handleUpload = async () => {
    if (!file || !selectedProject) {
      setMessage("Select project and file");
      return;
    }

    try {
      setMessage("");
      setProgress(10);

      const formData = new FormData();
      formData.append("myFile.xlsx", file);

      await uploadFile(formData, {
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      setMessage(`File uploaded successfully for project ${selectedProject}`);
    } catch (err) {
      console.error(err);
      setMessage("File upload failed");
      setProgress(0);
    }
  };

  /* ---------------- MAP ENDPOINTS ---------------- */

  const handleMapEndpoints = async () => {
    try {
      setLoadingMap(true);

      let endPointMap = await mapUserProjectEps({
        userId: user.userId,
        projectCode: selectedProject,
      });
      if (endPointMap.data.responseCode === 200) {
        // setLoadingMap(true);
        setMessage("Endpoints mapped to user successfully");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to map endpoints to user");
      // setLoadingMap(false);
    } finally {
      setLoadingMap(false); // ✅ ALWAYS reset loading
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" mb={2}>
        Upload Project File
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* PROJECT SELECT */}
          <TextField
            select
            size="small"
            label="Project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {mappedProjects.map((project) => (
              <MenuItem key={project.projectId} value={project.projectCode}>
                {project.projectName}
              </MenuItem>
            ))}
          </TextField>

          {/* FILE PICKER */}
          <Stack direction="row" spacing={2} alignItems="center">
            <input
              type="file"
              accept=".xls,.xlsx"
              hidden
              id="excel-upload"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            <label htmlFor="excel-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<FaFileExcel />}
              >
                Choose File
              </Button>
            </label>

            <Typography
              variant="body2"
              sx={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {file ? file.name : "No file selected"}
            </Typography>
          </Stack>

          {/* UPLOAD BUTTON */}
          <Button
            variant="contained"
            disabled={!file || !selectedProject}
            onClick={handleUpload}
          >
            Upload File
          </Button>

          {/* PROGRESS */}
          {progress > 0 && (
            <LinearProgress variant="determinate" value={progress} />
          )}

          <Divider />

          {/* MAP ENDPOINTS BUTTON */}
          <Button
            variant="outlined"
            color="success"
            disabled={!selectedProject || loadingMap}
            onClick={handleMapEndpoints}
          >
            {loadingMap ? "Mapping..." : "Map Endpoints to User"}
          </Button>

          {/* STATUS */}
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminFileUpload;
