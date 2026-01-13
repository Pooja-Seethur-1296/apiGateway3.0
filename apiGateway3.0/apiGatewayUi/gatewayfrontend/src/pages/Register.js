import { TextField, Button, Stack, Link, MenuItem } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useContext, useState } from "react";
import { registerUser } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    await registerUser({
      userName: data.get("name"),
      emailId: data.get("email"),
      password: data.get("password"),
      role: data.get("userRole"),
      adminSecret: "sharedAdminSecret",
    });

    navigate("/");
  };

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField name="name" label="Name" required />
          <TextField name="email" label="Email" required />
          <TextField name="role" label="Role" select required>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="infiniteUser">Infinte user</MenuItem>
            <MenuItem value="superAdmin">Super admin</MenuItem>
            onChange={(e) => setRole(e.target.value)}
          </TextField>
          {/* Email shown only if admin selected */}
          {role === "superAdmin" && (
            <TextField name="adminSecret" label="adminSecret" required />
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
    </AuthLayout>
  );
}
