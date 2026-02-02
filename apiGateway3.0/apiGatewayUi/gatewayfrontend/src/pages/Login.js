import {
  TextField,
  Button,
  Stack,
  Link,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { loginUser } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      const res = await loginUser({
        emailId: data.get("email"),
        password: data.get("password"),
      });

      login(res.data);

      if (
        res.data.responseCode === 200 &&
        res.data.responseObject.userDetails.userRole === "superAdmin"
      ) {
        navigate("/dashboard");
      } else if (
        res.data.responseCode === 200 &&
        res.data.responseObject.userDetails.userRole === "admin"
      ) {
        navigate("/adminDashboard");
      } else if (
        res.data.responseCode === 200 &&
        res.data.responseObject.userDetails.userRole === "user"
      ) {
        navigate("/userDashboard");
      }
    } catch (err) {
      setError(err.response?.data?.responseDescription || "Login failed");
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
            background: "linear-gradient(180deg, #334155 0%, #0f172a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome to Ortusolis API Gateway
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
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
              Login
            </Button>

            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{
                color: "#0f172a",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Create new account
            </Link>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
