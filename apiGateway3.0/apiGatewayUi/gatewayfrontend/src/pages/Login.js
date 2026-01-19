import { TextField, Button, Stack, Link } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthLayout from "../components/AuthLayout";
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
      console.log(res.data.responseCode);
      console.log(res.data.responseObject.userDetails.userRole);
      if (
        (res.data.responseCode === 200) &
        (res.data.responseObject.userDetails.userRole === "superAdmin")
      ) {
        navigate("/dashboard");
      } else if (
        (res.data.responseCode === 200) &
        (res.data.responseObject.userDetails.userRole === "admin")
      ) {
        navigate("/adminDashboard");
      }
    } catch (err) {
      setError(err.response?.data?.responseDescription || "Login failed");
    }
  };

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField name="email" label="Email" required />
          <TextField
            name="password"
            label="Password"
            type="password"
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <Button type="submit" variant="contained" size="large">
            Login
          </Button>

          <Link component={RouterLink} to="/register">
            Create new account
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
}
