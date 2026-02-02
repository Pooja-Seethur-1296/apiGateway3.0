// import React, { useState, useContext, useEffect } from "react";
// import { TextField, Button, Stack, MenuItem } from "@mui/material";
// import { AuthContext } from "../context/AuthContext";
// import {
//   getUserList,
//   getProjectList,
//   userProjectMap,
//   getProjectsMappedToUser,
// } from "../api/authApi";

// const Admindashboard = () => {
//   const { user, updateUser } = useContext(AuthContext);

//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     userRole: "",
//   });

//   const [usersCount, setUsersCount] = useState(0);
//   const [projectsCount, setProjectsCount] = useState(0);
//   const [mappedProjects, setMappedProjects] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.userName,
//         email: user.email || "",
//         userRole: user.userRole,
//       });
//       fetchMappedProjects();
//       fetchCounts();
//     }
//   }, [user]);

//   const fetchMappedProjects = async () => {
//     try {
//       const res = await getProjectsMappedToUser({ userId: user.userId });
//       setMappedProjects(res.data.responseObject);
//     } catch (err) {
//       console.error("Failed to fetch mapped projects", err);
//     }
//   };

//   const fetchCounts = async () => {
//     try {
//       const usersRes = await getUserList();
//       setUsersCount(usersRes.data.responseObject.users.length);

//       const projectsRes = await getProjectList();
//       console.log(projectsRes.data);
//       setProjects(projectsRes.data.responseObject.projects);
//       setProjectsCount(projectsRes.data.responseObject.projects.length);
//     } catch (err) {
//       console.error("Failed to fetch counts", err);
//     }
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSave = () => {
//     updateUser({ ...user, ...formData });
//     setIsEditing(false);
//   };

//   return (
//     <>
//       {/* Project Selector */}
//       <div style={{ maxWidth: 320, marginBottom: 24 }}>
//         <TextField
//           select
//           fullWidth
//           size="small"
//           label="Select Project"
//           value={selectedProject}
//           onChange={(e) => setSelectedProject(e.target.value)}
//         >
//           {mappedProjects.map((project) => (
//             <MenuItem key={project.projectId} value={project.projectCode}>
//               {project.projectName}
//             </MenuItem>
//           ))}
//         </TextField>
//       </div>

//       {/* Stats Cards */}
//       <div style={styles.cards}>
//         <div style={styles.card}>
//           <h4>Total endpoints in project</h4>
//           <p style={styles.cardValue}>50</p>
//         </div>

//         <div style={styles.card}>
//           <h4>Active Users</h4>
//           <p style={styles.cardValue}>{usersCount}</p>
//         </div>

//         <div style={styles.card}>
//           <h4>Endpoint access percentage</h4>
//           <p style={styles.cardValue}>80%</p>
//         </div>
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modal}>
//             <h2>Edit Profile</h2>
//             <Stack spacing={2} marginTop={2}>
//               <TextField
//                 label="Name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 size="small"
//               />
//               <TextField
//                 label="Email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 size="small"
//               />
//               <TextField
//                 select
//                 label="Role"
//                 value={formData.userRole}
//                 onChange={handleChange}
//                 size="small"
//               >
//                 <MenuItem value="user">User</MenuItem>
//                 <MenuItem value="infiniteUser">Infinite User</MenuItem>
//                 <MenuItem value="superAdmin">Super Admin</MenuItem>
//               </TextField>
//             </Stack>

//             <div style={styles.modalActions}>
//               <Button variant="outlined" onClick={() => setIsEditing(false)}>
//                 Cancel
//               </Button>
//               <Button variant="contained" onClick={handleSave}>
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// const styles = {
//   welcomeText: {
//     fontSize: 16,
//     fontWeight: 500,
//     marginBottom: 20,
//   },

//   cards: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//     gap: 16,
//   },

//   card: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 14,
//     boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
//   },

//   cardValue: {
//     fontSize: 26,
//     fontWeight: 700,
//     color: "#2563eb",
//     marginTop: 8,
//   },

//   modalOverlay: {
//     position: "fixed",
//     inset: 0,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   },

//   modal: {
//     backgroundColor: "#fff",
//     padding: 24,
//     borderRadius: 16,
//     width: 400,
//   },

//   modalActions: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: 12,
//     marginTop: 24,
//   },
// };

// export default Admindashboard;

import React, { useState, useContext, useEffect } from "react";
import { TextField, Button, Stack, MenuItem } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import {
  getUserList,
  getProjectList,
  getProjectsMappedToUser,
} from "../api/authApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const Admindashboard = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userRole: "",
  });

  const [usersCount, setUsersCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [mappedProjects, setMappedProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  // Mock endpoint access percentage
  const [endpointPercentage, setEndpointPercentage] = useState(80);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.userName,
        email: user.email || "",
        userRole: user.userRole,
      });
      fetchMappedProjects();
      fetchCounts();
    }
  }, [user]);

  const fetchMappedProjects = async () => {
    try {
      const res = await getProjectsMappedToUser({ userId: user.userId });
      setMappedProjects(res.data.responseObject);
    } catch (err) {
      console.error("Failed to fetch mapped projects", err);
    }
  };

  const fetchCounts = async () => {
    try {
      const usersRes = await getUserList();
      setUsersCount(usersRes.data.responseObject.users.length);

      const projectsRes = await getProjectList();
      setProjects(projectsRes.data.responseObject.projects);
      setProjectsCount(projectsRes.data.responseObject.projects.length);
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  // Chart Data
  const overviewData = [
    { name: "Users", value: usersCount },
    { name: "Projects", value: projectsCount },
  ];

  const endpointData = [
    { name: "Used", value: endpointPercentage },
    { name: "Unused", value: 100 - endpointPercentage },
  ];

  const totalEndpointsData = [
    { name: "Jan", endpoints: 20 },
    { name: "Feb", endpoints: 35 },
    { name: "Mar", endpoints: 50 },
    { name: "Apr", endpoints: 60 },
    { name: "May", endpoints: 75 },
  ];

  const COLORS = ["#22c55e", "#e5e7eb"]; // Pie chart colors

  return (
    <>
      {/* Project Selector */}
      <div style={{ maxWidth: 320, marginBottom: 24 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Select Project"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {mappedProjects.map((project) => (
            <MenuItem key={project.projectId} value={project.projectCode}>
              {project.projectName}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        {/* Bar Chart */}
        {/* <div style={styles.chartCard}>
          <h4>Users vs Projects</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overviewData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div> */}

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <h4>Endpoint Access %</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={endpointData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {endpointData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div style={styles.chartCard}>
          <h4>Total Endpoints Growth</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={totalEndpointsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="endpoints"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },
  chartCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
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
