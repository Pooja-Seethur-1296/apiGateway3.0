import { Container, Paper, Typography } from "@mui/material";

export default function AuthLayout({ title, children }) {
  return (
    <Container maxWidth="sm">
      <Paper
        elevation={8}
        sx={{
          mt: 10,
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3}>
          {title}
        </Typography>
        {children}
      </Paper>
    </Container>
  );
}
