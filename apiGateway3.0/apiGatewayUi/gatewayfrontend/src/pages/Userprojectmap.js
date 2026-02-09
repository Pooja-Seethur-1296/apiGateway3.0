import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Stack,
} from "@mui/material";
import {
  getUserList,
  getProjectList,
  userProjectMap,
  getProjectsMappedToUser,
  userProjectModifyMap,
} from "../api/authApi";

const ProjectMappingWithRole = () => {
  /* ---------------- STATE ---------------- */

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignments, setAssignments] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  /* ---------------- FETCH INITIAL DATA ---------------- */

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    const res = await getUserList();
    const normalizedUsers = res.data.responseObject.users.map((u) => ({
      ...u,
      userId: String(u._id),
    }));
    setUsers(normalizedUsers);
  };

  const fetchProjects = async () => {
    const res = await getProjectList();
    setProjects(res.data.responseObject.projects);
  };

  /* ---------------- DERIVED USER ---------------- */

  const selectedUser = useMemo(
    () => users.find((u) => u.userId === selectedUserId),
    [users, selectedUserId],
  );

  /* ---------------- LOAD USER MAPPINGS ---------------- */

  useEffect(() => {
    if (!selectedUserId) {
      setAssignments({});
      return;
    }

    loadUserProjectMappings(selectedUserId);
  }, [selectedUserId]);

  const loadUserProjectMappings = async (userId) => {
    try {
      const res = await getProjectsMappedToUser({ userId });
      const mappedProjects = res.data.responseObject || [];

      // Build assignment map
      const map = {};
      projects.forEach((p) => {
        map[p.projectCode] = false;
      });

      mappedProjects.forEach((p) => {
        map[p.projectCode] = true;
      });

      setAssignments(map);
    } catch {
      setAssignments({});
    }
  };

  /* ---------------- HANDLERS ---------------- */

  const toggleProject = (projectCode) => {
    setAssignments((prev) => ({
      ...prev,
      [projectCode]: !prev[projectCode],
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const payload = Object.entries(assignments)
        .filter(([_, assigned]) => assigned)
        .map(([projectCode]) => {
          const project = projects.find((p) => p.projectCode === projectCode);

          return {
            userId: selectedUser.userId,
            userName: selectedUser.userName,
            userRole: selectedUser.userRole,
            projectId: project.projectId,
            projectCode: project.projectCode,
            projectName: project.projectName,
          };
        });

      await userProjectModifyMap(payload);

      setAlert({
        show: true,
        message: "Project assignments updated successfully",
        severity: "success",
      });
    } catch {
      setAlert({
        show: true,
        message: "Failed to update project assignments",
        severity: "error",
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" mb={3}>
        User To Project Mapping
      </Typography>

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

      {/* USER SELECT */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select User</InputLabel>
        <Select
          label="Select User"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {users.map((u) => (
            <MenuItem key={u.userId} value={u.userId}>
              {u.userName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* USER DETAILS */}
      {selectedUser && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f9fafb" }}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            User Details
          </Typography>

          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedUser.userName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {selectedUser.emailId}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong>{" "}
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                }}
              >
                {selectedUser.userRole}
              </Box>
            </Typography>
          </Stack>
        </Paper>
      )}

      {/* PROJECT TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 550 }}>Project Name</TableCell>
              <TableCell sx={{ fontWeight: 550 }}>Assigned</TableCell>
              <TableCell sx={{ fontWeight: 550 }}>User Role</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.projectId}>
                <TableCell>{project.projectName}</TableCell>

                <TableCell>
                  <Checkbox
                    checked={assignments[project.projectCode] || false}
                    disabled={!selectedUserId}
                    onChange={() => toggleProject(project.projectCode)}
                  />
                </TableCell>

                <TableCell>
                  {selectedUser ? selectedUser.userRole : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        sx={{ mt: 3 }}
        variant="contained"
        disabled={!selectedUserId}
        onClick={handleSave}
      >
        Save Assignments
      </Button>
    </Box>
  );
};

export default ProjectMappingWithRole;
