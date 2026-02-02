import {
  TextField,
  Button,
  Stack,
  Link,
  Box,
  Paper,
  Typography,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      const register = await registerUser({
        userName: data.get("name"),
        emailId: data.get("email"),
        password: data.get("password"),
        userRole: data.get("role"),
        adminSecret: data.get("adminSecret") || "",
      });

      if (register.data.responseCode === 200) {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.responseDescription || "Registration failed",
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #334155 0%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: 420,
          p: 4,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          color: "#0f172a",
        }}
      >
        {/* Logo */}
        <Box textAlign="center" mb={2}>
          <img src="/favicon.png" alt="Ortusolis Logo" width={44} height={44} />
        </Box>

        {/* Heading */}
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          mb={3}
          sx={{
            background: "linear-gradient(180deg, #334155 0%, #192643 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create your Ortusolis account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="name"
              label="Name"
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                },
              }}
            />

            <TextField
              name="email"
              label="Email"
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                },
              }}
            />

            <TextField
              name="role"
              label="Role"
              select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="infiniteUser">Infinite User</MenuItem>
              <MenuItem value="superAdmin">Super Admin</MenuItem>
            </TextField>

            {/* Admin Secret (only for Super Admin) */}
            {role === "superAdmin" && (
              <TextField
                name="adminSecret"
                label="Admin Secret"
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
            )}

            <TextField
              name="password"
              label="Password"
              type="password"
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                },
              }}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                background: "linear-gradient(135deg, #545598, #2c568a)",
                fontWeight: "bold",
                "&:hover": {
                  background:
                    "linear-gradient(180deg, #30425b 0%, #304064 100%)",
                },
              }}
            >
              Register
            </Button>

            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{
                color: "#0f172a",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Already have an account?
            </Link>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
