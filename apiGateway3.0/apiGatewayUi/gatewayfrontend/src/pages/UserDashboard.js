import React, { useEffect, useState, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TextField, MenuItem, Paper, Typography } from "@mui/material";
import {
  getAPIAccessStatistics,
  getProjectsMappedToUser,
} from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#facc15",
];

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [chartData, setChartData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  // Fetch user projects
  useEffect(() => {
    if (!user?.userId) return;
    const fetchProjects = async () => {
      try {
        const res = await getProjectsMappedToUser({ userId: user.userId });
        const projList = res.data.responseObject || [];
        setProjects(projList);
        if (projList.length) setSelectedProject(projList[0].projectCode);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, [user]);

  // Fetch API stats whenever project changes
  useEffect(() => {
    if (!user?.userId || !selectedProject) return;
    const fetchStats = async () => {
      try {
        const res = await getAPIAccessStatistics({
          userId: user.userId,
          projectCode: selectedProject,
        });
        const data = res.data.responseObject || [];
        const formatted = data
          .map((item) => ({
            token: item.apiToken,
            count: item.apiAccessCount,
          }))
          .sort((a, b) => b.count - a.count);
        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch API stats", err);
      }
    };
    fetchStats();
  }, [user, selectedProject]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <Typography variant="h5" mb={3} gutterBottom>
        API Usage Dashboard
      </Typography>

      {/* Project selector */}
      <TextField
        select
        label="Select Project"
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
      >
        {projects.map((p) => (
          <MenuItem key={p.projectId} value={p.projectCode}>
            {p.projectName}
          </MenuItem>
        ))}
      </TextField>

      {/* Charts grid */}
      <div style={styles.grid}>
        {/* Bar chart */}
        <Paper style={styles.chartCard}>
          <Typography variant="h7" gutterBottom>
            API Usage by Token
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="token"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12, fill: "#374151" }}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, (max) => Math.max(max, 5)]}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(val) => [`${val}`, "Access Count"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} minPointSize={6}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.count === 0
                        ? "#e5e7eb"
                        : COLORS[idx % COLORS.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Pie chart */}
        <Paper style={styles.chartCard}>
          <Typography variant="h7" gutterBottom>
            API Usage Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="token"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.count === 0
                        ? "#e5e7eb"
                        : COLORS[idx % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 24,
    fontFamily: "Inter, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 24,
  },
  chartCard: {
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
  },
};

export default UserDashboard;
