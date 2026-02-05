import React, { useState, useContext, useEffect } from "react";
import { TextField, Button, Stack, MenuItem } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { getProjectsMappedToUser, allAPIAccessPerAdmin } from "../api/authApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const Admindashboard = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [maxEndpointUsage, setMaxEndpointUsage] = useState(0);
  const [apiAccessData, setApiAccessData] = useState([]);
  const [mappedProjects, setMappedProjects] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userRole: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.userName,
        email: user.email || "",
        userRole: user.userRole,
      });

      fetchMappedProjects();
      fetchApiAccessStats();
    }
  }, [user]);

  const fetchMappedProjects = async () => {
    try {
      const res = await getProjectsMappedToUser({ userId: user.userId });
      setMappedProjects(res.data.responseObject || []);
    } catch (err) {
      console.error("Failed to fetch mapped projects", err);
    }
  };

  const fetchApiAccessStats = async () => {
    try {
      const apiRes = await allAPIAccessPerAdmin({ userId: user.userId });
      const data = apiRes?.data?.responseObject || [];

      // Aggregate by projectCode
      const aggregated = data.reduce((acc, item) => {
        acc[item.projectCode] = {
          projectCode: item.projectCode,
          apiAccessCount:
            (acc[item.projectCode]?.apiAccessCount || 0) + item.apiAccessCount,
        };
        return acc;
      }, {});

      setApiAccessData(Object.values(aggregated));

      const counts = data.map((item) => item.apiAccessCount);
      setMaxEndpointUsage(counts.length ? Math.max(...counts) : 0);
    } catch (err) {
      console.error("Failed to fetch API access stats", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  const maxUsageChartData = [
    {
      name: "Max Usage",
      value: maxEndpointUsage,
      fill: "#6366f1",
    },
  ];

  return (
    <>
      {/* API Access Per Project */}
      <div style={styles.chartCard}>
        <h4 style={{ marginBottom: 16 }}>API Access Per Project</h4>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={apiAccessData}>
            <defs>
              <linearGradient id="apiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="projectCode" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="apiAccessCount"
              fill="url(#apiGradient)"
              radius={[10, 10, 0, 0]}
              barSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Maximum Endpoint Usage */}
      <div style={styles.chartCard}>
        <h4 style={{ marginBottom: 16 }}>Maximum Endpoint Usage</h4>

        <ResponsiveContainer width="100%" height={280}>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={maxUsageChartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, Math.max(10, maxEndpointUsage)]}
              tick={false}
            />

            <RadialBar background clockWise dataKey="value" cornerRadius={10} />

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 28, fontWeight: 600, fill: "#111827" }}
            >
              {maxEndpointUsage}
            </text>

            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 14, fill: "#6b7280" }}
            >
              Peak Calls
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Edit Profile</h2>
            <Stack spacing={2} marginTop={2}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                size="small"
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                size="small"
              />
              <TextField
                select
                label="Role"
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="infiniteUser">Infinite User</MenuItem>
                <MenuItem value="superAdmin">Super Admin</MenuItem>
              </TextField>
            </Stack>

            <div style={styles.modalActions}>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  chartCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    marginBottom: 24,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: 400,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
};

export default Admindashboard;
