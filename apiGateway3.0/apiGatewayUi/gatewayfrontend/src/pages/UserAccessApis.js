import { useEffect, useState, useContext } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import {
  getEpsMappedToProjects,
  getProjectsMappedToUser,
} from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function UserAccessApis() {
  const { user } = useContext(AuthContext);

  /* ---------------- AUTH ---------------- */

  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user?.userId) return;
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, [user]);

  /* ---------------- PROJECTS ---------------- */

  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    if (!user?.userId) return;

    const fetchProjects = async () => {
      const res = await getProjectsMappedToUser({ userId: user.userId });
      setMappedProjects(res.data.responseObject || []);
    };

    fetchProjects();
  }, [user]);

  /* ---------------- ENDPOINTS ---------------- */

  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [endpointToken, setEndpointToken] = useState("");

  useEffect(() => {
    if (!selectedProject) {
      setEndpoints([]);
      return;
    }

    const fetchEndpoints = async () => {
      const res = await getEpsMappedToProjects({
        projectCode: selectedProject,
      });
      setEndpoints(res.data.responseObject || []);
    };

    fetchEndpoints();
  }, [selectedProject]);

  /* ---------------- REQUEST BUILDER ---------------- */

  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState(`{
  "Content-Type": "application/json"
}`);
  const [body, setBody] = useState("");

  const handleEndpointSelect = (endpointPath) => {
    const ep = endpoints.find((e) => e.endPoint === endpointPath);
    if (!ep) return;

    setSelectedEndpoint(endpointPath);
    setMethod(ep.requestType);
    setUrl(ep.endPoint);
    setBody(ep.sampleRequestSchema || "");
    setEndpointToken(ep.endPointToken || "");
  };

  /* ---------------- RESPONSE ---------------- */

  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setStatus(null);
    setResponseTime(null);

    const start = performance.now();

    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      if (token) parsedHeaders.Authorization = `Bearer ${token}`;

      const options = {
        method,
        headers: parsedHeaders,
      };

      if (!["GET", "DELETE"].includes(method)) {
        options.body = body || null;
      }

      const res = await fetch(url, options);
      setStatus(res.status);

      const text = await res.text();
      try {
        setResponse(JSON.parse(text));
      } catch {
        setResponse(text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setResponseTime(`${Math.round(performance.now() - start)} ms`);
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h5" mb={2}>
        API Playground
      </Typography>

      {/* PROJECT */}
      <Box sx={{ maxWidth: 360, mb: 2 }}>
        <TextField
          select
          label="Project"
          size="small"
          fullWidth
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setSelectedEndpoint("");
            setEndpointToken("");
            setUrl("");
            setBody("");
          }}
        >
          {mappedProjects.map((p) => (
            <MenuItem key={p.projectId} value={p.projectCode}>
              {p.projectName}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* API + TOKEN */}
      <Box sx={{ maxWidth: 900, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            select
            label="API Endpoint"
            size="small"
            fullWidth
            value={selectedEndpoint}
            onChange={(e) => handleEndpointSelect(e.target.value)}
            disabled={!selectedProject}
          >
            {endpoints.map((ep) => (
              <MenuItem key={ep.endPoint} value={ep.endPoint}>
                {ep.description}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Endpoint Token"
            size="small"
            value={endpointToken}
            disabled
            sx={{
              width: 260,
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* REQUEST LINE */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          select
          size="small"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ width: 120 }}
        >
          {METHODS.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          placeholder="/api/endpoint"
        />

        <button
          onClick={sendRequest}
          disabled={!url || loading}
          style={{
            padding: "6px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </Box>

      {/* HEADERS & BODY */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2 }}>
        <Box>
          <Typography fontSize={12} fontWeight={600} mb={0.5}>
            Headers
          </Typography>
          {/* AUTH STATUS */}
          <Chip
            label={token ? "Auth Enabled" : "Auth Disabled"}
            color={token ? "success" : "error"}
            size="small"
            sx={{ mb: 3 }}
          />
          <TextField
            multiline
            minRows={4}
            maxRows={4}
            fullWidth
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            sx={{ fontFamily: "monospace" }}
          />
        </Box>

        <Box>
          <Typography fontSize={12} fontWeight={600} mb={0.5}>
            Body
          </Typography>
          <TextField
            multiline
            minRows={6}
            fullWidth
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={["GET", "DELETE"].includes(method)}
            sx={{ fontFamily: "monospace" }}
          />
        </Box>
      </Box>

      {/* RESPONSE */}
      <Box mt={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontWeight={600}>Response</Typography>

          {status && (
            <Chip
              label={status}
              size="small"
              color={
                status >= 200 && status < 300
                  ? "success"
                  : status >= 400
                    ? "error"
                    : "warning"
              }
            />
          )}

          {responseTime && (
            <Typography fontSize={12} color="text.secondary">
              {responseTime}
            </Typography>
          )}
        </Box>

        {error && (
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              background: "#7f1d1d",
              color: "#fee2e2",
              borderRadius: 1,
            }}
          >
            {error}
          </Box>
        )}

        {response !== null && (
          <Box
            sx={{
              mt: 1,
              p: 2,
              background: "#020617",
              color: "#e5e7eb",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {typeof response === "string"
              ? response
              : JSON.stringify(response, null, 2)}
          </Box>
        )}
      </Box>
    </Box>
  );
}
