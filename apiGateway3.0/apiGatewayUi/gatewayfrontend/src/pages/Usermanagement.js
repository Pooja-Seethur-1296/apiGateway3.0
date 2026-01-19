import React, { useState } from "react";
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
} from "@mui/material";

const UserManagement = () => {
  const [users, setUsers] = useState([]); // list of users
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  // Handle input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add new user
  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill name and email");
      return;
    }
    const newUser = {
      id: Date.now(),
      ...formData,
    };
    setUsers([...users, newUser]);
    setFormData({ name: "", email: "", role: "user" });
  };

  // Optional: Delete user
  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div>
      <Typography variant="h5" mb={3}>
        User Management
      </Typography>

      {/* Form to create user */}
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
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
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="infiniteUser">Infinite User</MenuItem>
            <MenuItem value="superAdmin">Super Admin</MenuItem>
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddUser}
            sx={{ height: "56px" }}
          >
            Add User
          </Button>
        </Stack>
      </Paper>

      {/* Users table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users created yet
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(user.id)}
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
