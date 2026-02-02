import React, { useState, useContext, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { IconButton, TextField, Button, Stack, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const { user, updateUser } = useContext(AuthContext);

  /* Sidebar state */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [dragging, setDragging] = useState(false);

  /* Profile modal state */
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userRole: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.userName || "",
        email: user.email || "",
        userRole: user.userRole || "",
      });
    }
  }, [user]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const onDrag = (e) => {
    if (!dragging) return;
    let newWidth = e.clientX;
    if (newWidth < 70) newWidth = 70;
    if (newWidth > 380) newWidth = 380;
    setSidebarWidth(newWidth);
  };

  useEffect(() => {
    const stopDrag = () => setDragging(false);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateUser({
      ...user,
      userName: formData.name,
      email: formData.email,
      userRole: formData.userRole,
    });
    setIsEditing(false);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? 70 : sidebarWidth,
        }}
      >
        <div style={styles.logoArea}>
          <img
            src="https://ortusolis.com/wp-content/uploads/2025/01/LogoBGR-3.png"
            alt="Logo"
            style={styles.logoImg}
          />
          {!sidebarCollapsed && (
            <span style={styles.logoText}>API Gateway</span>
          )}
          <IconButton onClick={toggleSidebar} style={styles.collapseBtn}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </div>

        <ul style={styles.list}>
          {[
            { path: "/dashboard", label: "Insights Dashboard" },
            { path: "/userManagement", label: "User Management" },
            { path: "/projects", label: "Projects" },
            { path: "/userProject", label: "User-Project Maps" },
            { path: "/", label: "Logout" },
          ].map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.link,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  color: isActive ? "#fff" : "#cbd5e1",
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div
          onMouseDown={() => setDragging(true)}
          style={styles.resizeHandle}
        />
      </aside>

      {/* Main area */}
      <div style={styles.mainWrapper}>
        {/* Topbar */}
        <header style={styles.topBar}>
          {/* Left: Title */}
          <div style={styles.topBarLeft}>
            {/* <h1 style={styles.title}>Dashboard</h1> */}
            <p style={styles.welcomeText}>
              Welcome, <strong>{formData.name || "User"}</strong>
            </p>
          </div>

          {/* Right: Profile */}
          <div style={styles.topBarRight}>
            <div style={styles.profile} onClick={() => setIsEditing(true)}>
              <img
                src={`https://ui-avatars.com/api/?name=${user?.userName || "User"}&background=2563eb&color=fff`}
                alt="avatar"
                style={styles.avatar}
              />
              <div style={styles.profileText}>
                <div style={styles.userName}>{user?.userName}</div>
                <div style={styles.userRole}>{user?.userRole}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Edit Profile</h2>
            <Stack spacing={2} mt={2}>
              <TextField
                label="Name"
                name="name"
                size="small"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                size="small"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Role"
                size="small"
                value={formData.userRole}
                fullWidth
                disabled
              />
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
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f4f6f8",
  },
  sidebar: {
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: "20px 12px",
    position: "relative",
    transition: "width 0.25s ease",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "36px",
    position: "relative",
  },
  logoImg: { width: 40, height: 40, borderRadius: 8 },
  logoText: { fontSize: 18, fontWeight: 700 },
  collapseBtn: { position: "absolute", right: -8, top: 3, color: "#fff" },
  list: { listStyle: "none", padding: 0, margin: 0 },
  link: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    marginBottom: "8px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s",
  },
  linkHover: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  resizeHandle: {
    width: 5,
    cursor: "col-resize",
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  mainWrapper: { flex: 1, display: "flex", flexDirection: "column" },
  topBar: {
    height: 100, // increased height
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  topBarLeft: { display: "flex", alignItems: "center" },
  topBarRight: { display: "flex", alignItems: "center", gap: 16 },
  title: { fontSize: 22, fontWeight: 700 },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    transition: "background 0.2s",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "2px solid #38bdf8",
  },
  profileText: { display: "flex", flexDirection: "column", lineHeight: 1.2 },
  userName: { fontSize: 14, fontWeight: 600 },
  userRole: { fontSize: 11, color: "#94a3b8", textTransform: "capitalize" },
  main: { padding: 28, overflowY: "auto" },
  welcomeText: { fontSize: 18, marginBottom: 16 },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: { backgroundColor: "#fff", padding: 24, borderRadius: 16, width: 400 },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
};

export default Layout;
