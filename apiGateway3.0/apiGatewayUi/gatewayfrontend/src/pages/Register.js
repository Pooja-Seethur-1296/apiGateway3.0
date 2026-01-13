import {
  TextField,
  Button,
  Stack,
  Link,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { registerUser } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    await registerUser({
      userName: data.get("name"),
      emailId: data.get("email"),
      password: data.get("password"),
      userRole: data.get("role"),
      adminSecret: data.get("adminSecret") || "",
    });

    setSnackbar({
      open: true,
      message: "Registration successful!",
      severity: "success",
    });
    navigate("/");
  };

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField name="name" label="Name" required />
          <TextField name="email" label="Email" required />

          <TextField
            name="role"
            label="Role"
            select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="infiniteUser">Infinite user</MenuItem>
            <MenuItem value="superAdmin">Super admin</MenuItem>
          </TextField>

          {/* Admin Secret only for Super Admin */}
          {role === "superAdmin" && (
            <TextField name="adminSecret" label="Admin Secret" required />
          )}

          <TextField
            name="password"
            label="Password"
            type="password"
            required
          />

          <Button type="submit" variant="contained" size="large">
            Register
          </Button>

          <Link component={RouterLink} to="/">
            Already have an account?
          </Link>
        </Stack>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}
