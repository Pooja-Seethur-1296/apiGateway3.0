import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getEpsMappedToProjects,
  getUserList,
  getProjectList,
} from "../api/authApi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [usersCount, setUsersCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const usersRes = await getUserList();
      setUsersCount(usersRes.data.responseObject.users.length);

      const projectsRes = await getProjectList();
      setProjectsCount(projectsRes.data.responseObject.projects.length);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const [endpointData, setEndpointData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!user?.userId) return;
    fetchEndpointData();
  }, [user]);

  const fetchEndpointData = async () => {
    try {
      const res = await getEpsMappedToProjects({});
      const endpoints = res.data.responseObject || [];

      // Group endpoints by projectCode
      const grouped = endpoints.reduce((acc, item) => {
        if (!acc[item.projectCode]) acc[item.projectCode] = 0;
        acc[item.projectCode] += 1;
        return acc;
      }, {});
      console.log(grouped);

      // Prepare data for charts
      const chartArr = Object.keys(grouped)
        .map((project) => ({
          project,
          endpoints: grouped[project],
        }))
        .sort((a, b) => b.endpoints - a.endpoints);
      console.log(chartArr);

      setEndpointData(endpoints);
      setChartData(chartArr);
    } catch (err) {
      console.error("Failed to fetch endpoint data", err);
    }
  };

  const barData = [
    { name: "Users", count: usersCount },
    { name: "Projects", count: projectsCount },
  ];

  return (
    <div style={styles.grid}>
      {/* Bar Chart */}
      <div style={styles.chartCard}>
        <h4>Overview</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart: Projects vs Total Endpoints */}
      <div style={styles.chartCard}>
        <h4>Projects vs Total Endpoints</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="project"
              interval={0}
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 12, fill: "#475569" }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, (dataMax) => Math.max(dataMax, 5)]}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              formatter={(value) => [`${value}`, "Total Endpoints"]}
            />
            <Bar
              dataKey="endpoints"
              radius={[6, 6, 0, 0]}
              minPointSize={6} // makes 0 visible
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Endpoint Distribution */}
      <div style={styles.chartCard}>
        <h4>Endpoint Distribution per Project</h4>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="endpoints"
              nameKey="project"
              innerRadius={60}
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 20,
  },
  chartCard: {
    background: "#ffffff",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
};

export default Dashboard;
