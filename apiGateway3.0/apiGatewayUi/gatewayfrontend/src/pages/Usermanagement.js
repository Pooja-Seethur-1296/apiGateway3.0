import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
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
import { registerUser, getUserList, deleteUser } from "../api/authApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [alert, setAlert] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    userId: "",
  });

  /* ---------------- FETCH USERS ---------------- */

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUserList();
      setUsers(res.data.responseObject.users);
      // console.log(res);
      if (res.data.responseCode === 401) {
        setAlert("Session ended, please login");
      }
    } catch {
      setAlert("Failed to load users");
    }
  };

  /* ---------------- FORM HANDLERS ---------------- */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      setAlert("Name and Email are required");
      return;
    }

    try {
      const res = await registerUser({
        userName: formData.name,
        emailId: formData.email,
        userRole: formData.role,
      });

      setUsers((prev) => [...prev, res.data.responseObject]);
      setFormData({ name: "", email: "", role: "user" });
      setAlert("User created successfully");
    } catch {
      setAlert("Failed to create user");
    }
  };

  /* ---------------- DELETE (UI ONLY) ---------------- */

  const handleDelete = async (userId) => {
    console.log(userId);
    const res = await deleteUser({ userId: userId });
    setAlert("User deleted successfully!");
    // setUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  /* ---------------- UI ---------------- */

  return (
    <div>
      <Typography variant="h5" mb={3}>
        User Management
      </Typography>

      {alert && (
        <Alert sx={{ mb: 2 }} severity="info" onClose={() => setAlert("")}>
          {alert}
        </Alert>
      )}

      {/* CREATE USER */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="superAdmin">Super Admin</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="infiniteUser">Infinite User</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>

          <Button
            variant="contained"
            onClick={handleAddUser}
            sx={{ height: "56px" }}
          >
            Add User
          </Button>
        </Stack>
      </Paper>

      {/* USERS TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 550 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 550 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 550 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 550 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}

            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.userName}</TableCell>
                <TableCell>{user.emailId}</TableCell>
                <TableCell>{user.userRole}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserManagement;
