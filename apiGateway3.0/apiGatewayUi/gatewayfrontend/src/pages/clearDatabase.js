import React, { useState, useContext, useEffect } from "react";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
  Alert,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { getProjectsMappedToUser, flushDatabase } from "../api/authApi";

const FlushDb = () => {
  const { user } = useContext(AuthContext);

  const [secretKey, setSecretKey] = useState("");
  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  /* ---------------- FETCH PROJECTS ---------------- */

  useEffect(() => {
    if (!user?.userId) return;

    const fetchMappedProjects = async () => {
      try {
        const res = await getProjectsMappedToUser({ userId: user.userId });
        setMappedProjects(res.data.responseObject || []);
      } catch (err) {
        console.error("Failed to fetch mapped projects", err);
      }
    };

    fetchMappedProjects();
  }, [user]);

  /* ---------------- CLEAR CACHE ---------------- */

  const handleClearDb = async () => {
    try {
      setLoading(true);

      await flushDatabase({
        userId: user.userId,
        projectCode: selectedProject,
        secretKey,
      });

      setAlert({
        show: true,
        message: "Cache cleared successfully",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      if (err.status === 404) {
        setAlert({
          show: true,
          message: "Entered secretkey is wrong, retry or contact super-admin",
          severity: "error",
        });
      } else {
        setAlert({
          show: true,
          message: "Failed to clear cache",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Stack spacing={3} sx={{ maxWidth: 400 }}>
      <Typography variant="h6">Clear Project Cache</Typography>
      {alert.show && (
        <Alert
          sx={{ mb: 2 }}
          severity={alert.severity}
          variant="filled"
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}
      {/* PROJECT SELECT */}
      <TextField
        select
        label="Select Project"
        size="small"
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        fullWidth
      >
        {mappedProjects.map((project) => (
          <MenuItem key={project.projectId} value={project.projectCode}>
            {project.projectName}
          </MenuItem>
        ))}
      </TextField>

      {/* SECRET KEY */}
      <TextField
        label="Project Admin Secret Key"
        type="password"
        size="small"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
        fullWidth
      />

      {/* ACTION BUTTON */}
      <Button
        variant="contained"
        color="error"
        onClick={handleClearDb}
        disabled={!secretKey || !selectedProject || loading}
      >
        {loading ? "Clearing..." : "Clear Cache Database"}
      </Button>
    </Stack>
  );
};

export default FlushDb;
