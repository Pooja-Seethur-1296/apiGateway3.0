// import React, { useState, useContext, useEffect, useRef } from "react";
// import { TextField, Button, Stack, MenuItem, IconButton } from "@mui/material";
// import { AuthContext } from "../context/AuthContext";
// import { Link } from "react-router-dom";
// import MenuIcon from "@mui/icons-material/Menu";
// import { getUserList, getProjectList, userProjectMap } from "../api/authApi";

// const Dashboard = () => {
//   const { user, logout, updateUser } = useContext(AuthContext);

//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     userRole: "",
//   });
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [sidebarWidth, setSidebarWidth] = useState(240);
//   const sidebarRef = useRef(null);
//   const [dragging, setDragging] = useState(false);

//   const [usersCount, setUsersCount] = useState(0);
//   const [projectsCount, setProjectsCount] = useState(0);
//   // const [pendingReviews, setPendingReviews] = useState(0);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.userName,
//         email: user.email || "",
//         userRole: user.userRole,
//       });
//     }
//     fetchData();
//   }, [user]);

//   const fetchData = async () => {
//     try {
//       const usersRes = await getUserList();
//       setUsersCount(usersRes.data.responseObject.users.length);

//       const projectsRes = await getProjectList();
//       setProjectsCount(projectsRes.data.responseObject.projects.length);

//       // const pending = projectsData.filter((p) => p.status === "pending").length;
//       // setPendingReviews(pending);
//     } catch (err) {
//       console.error("Failed to fetch data", err);
//     }
//   };

//   const openModal = () => setIsEditing(true);
//   const closeModal = () => setIsEditing(false);
//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   const handleSave = () => {
//     updateUser({ ...user, ...formData });
//     setIsEditing(false);
//   };
//   const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

//   const startDrag = (e) => {
//     e.preventDefault();
//     setDragging(true);
//   };
//   const stopDrag = () => setDragging(false);
//   const onDrag = (e) => {
//     if (dragging) {
//       let newWidth = e.clientX;
//       if (newWidth < 70) newWidth = 70;
//       if (newWidth > 400) newWidth = 400;
//       setSidebarWidth(newWidth);
//     }
//   };
//   useEffect(() => {
//     window.addEventListener("mousemove", onDrag);
//     window.addEventListener("mouseup", stopDrag);
//     return () => {
//       window.removeEventListener("mousemove", onDrag);
//       window.removeEventListener("mouseup", stopDrag);
//     };
//   });

//   return (
//     <div style={styles.container}>
//       {/* Sidebar */}
//       <aside
//         ref={sidebarRef}
//         style={{
//           ...styles.sidebar,
//           width: sidebarCollapsed ? 70 : sidebarWidth,
//         }}
//       >
//         <div
//           style={{
//             ...styles.logoArea,
//             justifyContent: sidebarCollapsed ? "center" : "flex-start",
//           }}
//         >
//           <img
//             src="https://ortusolis.com/wp-content/uploads/2025/01/LogoBGR-3.png"
//             alt="Logo"
//             style={styles.logoImg}
//           />
//           {!sidebarCollapsed && <h2 style={styles.logoText}>API Gateway</h2>}
//           {/* Collapse button top-right of sidebar */}
//           <IconButton
//             onClick={toggleSidebar}
//             style={{
//               position: "absolute",
//               top: 15,
//               right: sidebarCollapsed ? -5 : -20,
//               backgroundColor: "#2563eb",
//               color: "#fff",
//               padding: 5,
//               borderRadius: "50%",
//               boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//               transition: "all 0.3s",
//               zIndex: 10,
//             }}
//           >
//             <MenuIcon fontSize="small" />
//           </IconButton>
//         </div>

//         <ul style={styles.list}>
//           <li style={styles.listItem}>
//             <Link to="/adminUpload" style={styles.link}>
//               User management
//             </Link>
//           </li>
//           <li style={styles.listItem}>
//             <Link to="/projects" style={styles.link}>
//               Projects
//             </Link>
//           </li>
//           <li style={styles.listItem}>
//             <Link to="/userProject" style={styles.link}>
//               User-Project Maps
//             </Link>
//           </li>
//         </ul>

//         <div
//           onMouseDown={(e) => setDragging(true)}
//           style={{
//             width: "5px",
//             cursor: "col-resize",
//             backgroundColor: "rgba(255,255,255,0.2)",
//             height: "100%",
//             position: "absolute",
//             top: 0,
//             right: 0,
//           }}
//         />
//       </aside>

//       {/* Main Wrapper */}
//       <div style={styles.mainWrapper}>
//         <header style={styles.topBar}>
//           <h1 style={styles.dashboardTitle}>API Gateway Dashboard</h1>
//           <div style={styles.profile}>
//             <img
//               src={`https://ui-avatars.com/api/?name=${
//                 formData.name || "User"
//               }&background=2563eb&color=fff`}
//               alt="avatar"
//               style={styles.avatar}
//             />
//             <button style={styles.editBtn} onClick={openModal}>
//               Edit Profile
//             </button>
//           </div>
//         </header>

//         <main style={styles.main}>
//           <p style={styles.welcomeText}>Welcome, {formData.name || "User"}!</p>
//           <div style={styles.cards}>
//             <div style={styles.card}>
//               <h4>Active Projects</h4>
//               <p style={styles.cardValue}>{projectsCount}</p>
//             </div>
//             <div style={styles.card}>
//               <h4>Total Users</h4>
//               <p style={styles.cardValue}>{usersCount}</p>
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Edit Modal */}
//       {isEditing && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modal}>
//             <div style={styles.modalHeader}>
//               <h2 style={styles.modalTitle}>Edit Profile</h2>
//             </div>
//             <Stack spacing={2} style={{ marginTop: "10px" }}>
//               <TextField
//                 label="Name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="Email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="Password"
//                 type="password"
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 select
//                 label="Role"
//                 value={formData.userRole}
//                 onChange={handleChange}
//                 fullWidth
//                 size="small"
//               >
//                 <MenuItem value="user">User</MenuItem>
//                 <MenuItem value="infiniteUser">Infinite User</MenuItem>
//                 <MenuItem value="superAdmin">Super Admin</MenuItem>
//               </TextField>
//             </Stack>
//             <div style={styles.modalActions}>
//               <Button variant="outlined" onClick={closeModal}>
//                 Cancel
//               </Button>
//               <Button variant="contained" onClick={handleSave}>
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const styles = {
//   container: {
//     display: "flex",
//     height: "100vh",
//     fontFamily: "'Inter', sans-serif",
//     fontSize: "14px",
//     backgroundColor: "#f4f6f8",
//   },
//   sidebar: {
//     backgroundColor: "#0f172a",
//     color: "#fff",
//     display: "flex",
//     flexDirection: "column",
//     padding: "20px 10px",
//     transition: "width 0.3s",
//     position: "relative",
//   },
//   logoArea: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     marginBottom: "30px",
//     position: "relative",
//   },
//   logoImg: { width: "40px", height: "40px", borderRadius: "8px" },
//   logoText: { fontSize: "20px", fontWeight: 700 },
//   list: { listStyle: "none", padding: 0, margin: 0 },
//   listItem: { marginBottom: "14px", borderRadius: "8px" },
//   link: {
//     textDecoration: "none",
//     color: "#fff",
//     display: "block",
//     padding: "12px 14px",
//     borderRadius: "8px",
//     fontWeight: 600,
//     fontSize: "15px",
//     transition: "all 0.2s",
//     hover: { backgroundColor: "rgba(255,255,255,0.1)" },
//   },
//   mainWrapper: { flex: 1, display: "flex", flexDirection: "column" },
//   topBar: {
//     height: "70px",
//     backgroundColor: "#1e293b",
//     color: "#fff",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "0 30px",
//   },
//   dashboardTitle: { fontSize: "20px", fontWeight: 700, margin: 0 },
//   profile: { display: "flex", alignItems: "center", gap: "12px" },
//   avatar: { width: "40px", height: "40px", borderRadius: "50%" },
//   editBtn: {
//     background: "none",
//     border: "none",
//     color: "#fff",
//     fontSize: "12px",
//     cursor: "pointer",
//   },
//   main: { padding: "25px" },
//   welcomeText: {
//     fontSize: "16px",
//     fontWeight: 500,
//     marginBottom: "20px",
//     color: "#333",
//   },
//   cards: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//     gap: "16px",
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: "18px",
//     borderRadius: "12px",
//     boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
//   },
//   cardValue: {
//     fontSize: "24px",
//     fontWeight: 600,
//     marginTop: "8px",
//     color: "#2563eb",
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
//     padding: "24px",
//     borderRadius: "16px",
//     width: "400px",
//     boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
//   },
//   modalHeader: { borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" },
//   modalTitle: { fontSize: "20px", fontWeight: 700, margin: 0 },
//   modalActions: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: "12px",
//     marginTop: "24px",
//   },
// };

// export default Dashboard;

import React, { useState, useContext, useEffect } from "react";
import { TextField, Button, Stack, MenuItem } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { getUserList, getProjectList } from "../api/authApi";

const Dashboard = () => {
  const { user, updateUser } = useContext(AuthContext);

  // const [isEditing, setIsEditing] = useState(false);
  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   userRole: "",
  // });

  const [usersCount, setUsersCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);

  // useEffect(() => {
  //   if (user) {
  //     setFormData({
  //       name: user.userName,
  //       email: user.email || "",
  //       userRole: user.userRole,
  //     });
  //   }
  //   fetchData();
  // }, [user]);

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

  // const handleChange = (e) =>
  //   setFormData({ ...formData, [e.target.name]: e.target.value });

  // // const handleSave = () => {
  // //   updateUser({ ...user, ...formData });
  // //   setIsEditing(false);
  // // };

  return (
    <>
      {/* Stats Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h4>Active Projects</h4>
          <p style={styles.cardValue}>{projectsCount}</p>
        </div>

        <div style={styles.card}>
          <h4>Total Users</h4>
          <p style={styles.cardValue}>{usersCount}</p>
        </div>
      </div>

      {/* Edit Profile Modal
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
                fullWidth
              />

              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                size="small"
                fullWidth
              />

              <TextField
                select
                label="Role"
                value={formData.userRole}
                onChange={handleChange}
                size="small"
                fullWidth
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
      )} */}
    </>
  );
};

const styles = {
  welcomeText: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 20,
    color: "#334155",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },

  cardValue: {
    fontSize: 26,
    fontWeight: 700,
    marginTop: 8,
    color: "#2563eb",
  },

  // modalOverlay: {
  //   position: "fixed",
  //   inset: 0,
  //   backgroundColor: "rgba(0,0,0,0.45)",
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   zIndex: 1000,
  // },

  // modal: {
  //   backgroundColor: "#ffffff",
  //   padding: 24,
  //   borderRadius: 16,
  //   width: 400,
  // },

  // modalActions: {
  //   display: "flex",
  //   justifyContent: "flex-end",
  //   gap: 12,
  //   marginTop: 24,
  // },
};

export default Dashboard;
