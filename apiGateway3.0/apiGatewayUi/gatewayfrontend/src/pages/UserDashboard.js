import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserList, getProjectList } from "../api/authApi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const UserDashboard = () => {
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

  const pieData = [
    { name: "Users", value: usersCount },
    { name: "Projects", value: projectsCount },
  ];

  const barData = [
    { name: "Users", count: usersCount },
    { name: "Projects", count: projectsCount },
  ];

  return (
    <div style={styles.grid}>
      {/* Pie Chart */}
      <div style={styles.chartCard}>
        <h4>Users vs Projects</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={90} label>
              <Cell fill="#2563eb" />
              <Cell fill="#16a34a" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },
  chartCard: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
};

export default UserDashboard;
