import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import { getUserList, getProjectList, userProjectMap } from "../api/authApi";

const ProjectMappingWithRole = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignments, setAssignments] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    const res = await getUserList();

    // 🔒 NORMALIZE USER ID TO STRING
    const normalizedUsers = res.data.responseObject.users.map((u) => ({
      ...u,
      userId: String(u.userId),
    }));

    setUsers(normalizedUsers);
  };

  const fetchProjects = async () => {
    const res = await getProjectList();
    setProjects(res.data.responseObject.projects);
  };

  /* ---------------- DERIVED STATE ---------------- */

  const selectedUser = useMemo(
    () => users.find((u) => u.userId === selectedUserId),
    [users, selectedUserId]
  );

  /* ---------------- LOAD ASSIGNMENTS ---------------- */

  useEffect(() => {
    if (!selectedUserId) {
      setAssignments({});
      return;
    }

    // TODO: Replace with real API
    setAssignments({});
  }, [selectedUserId]);

  /* ---------------- HANDLERS ---------------- */

  const toggleProject = (code) => {
    setAssignments((prev) => ({
      ...prev,
      [code]: {
        assigned: !prev[code]?.assigned,
        role: prev[code]?.role || "user",
      },
    }));
  };

  const changeRole = (code, role) => {
    setAssignments((prev) => ({
      ...prev,
      [code]: {
        assigned: true,
        role,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const payload = Object.entries(assignments)
        .filter(([_, val]) => val.assigned)
        .map(([projectCode, val]) => {
          const project = projects.find((p) => p.projectCode === projectCode);

          return {
            projectName: project.projectName,
            projectId: project.projectId,
            projectCode: project.projectCode,
            userProjectRole: val.role,
            userName: selectedUser.userName,
            userId: selectedUserId,
          };
        });

      await userProjectMap(payload);

      setAlert({
        show: true,
        message: "Projects mapped successfully!",
        severity: "success",
      });
    } catch {
      setAlert({
        show: true,
        message: "Failed to save assignments",
        severity: "error",
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        Map Projects to User with Role
      </Typography>

      {alert.show && (
        <Alert
          variant="filled"
          severity={alert.severity}
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {/* USER SELECT */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel id="user-select-label">Select User</InputLabel>
        <Select
          labelId="user-select-label"
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

      {/* SELECTED USER DISPLAY (DEBUG + UX) */}
      {selectedUser && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected User: <strong>{selectedUser.userName}</strong>
        </Typography>
      )}

      {/* PROJECTS TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Assigned</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const assigned =
                assignments[project.projectCode]?.assigned || false;
              const role = assignments[project.projectCode]?.role || "user";

              return (
                <TableRow key={project.projectId}>
                  <TableCell>{project.projectName}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={assigned}
                      disabled={!selectedUserId}
                      onChange={() => toggleProject(project.projectCode)}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={role}
                      disabled={!assigned || !selectedUserId}
                      onChange={(e) =>
                        changeRole(project.projectCode, e.target.value)
                      }
                    >
                      <MenuItem value="projectAdmin">Project Admin</MenuItem>
                      <MenuItem value="editor">Editor</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="inHouseUser">In-house User</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
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
