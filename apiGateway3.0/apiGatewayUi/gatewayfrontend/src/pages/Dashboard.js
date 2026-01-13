import { Button, Typography, Container } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Container sx={{ mt: 10 }}>
      <Typography variant="h4">Welcome {user?.name}</Typography>
      <Typography>Email: {user?.email}</Typography>

      <Button variant="contained" color="error" sx={{ mt: 3 }} onClick={logout}>
        Logout
      </Button>
    </Container>
  );
}
