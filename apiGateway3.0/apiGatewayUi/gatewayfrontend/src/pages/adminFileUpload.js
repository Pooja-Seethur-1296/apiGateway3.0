// import React, { useContext, useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   MenuItem,
//   TextField,
//   Typography,
//   Paper,
//   LinearProgress,
// } from "@mui/material";
// import { FaFileExcel, FaCloudUploadAlt } from "react-icons/fa";
// import { AuthContext } from "../context/AuthContext";
// import { getProjectsMappedToUser } from "../api/authApi";

// const AdminFileUpload = () => {
//   const { user } = useContext(AuthContext);

//   const [mappedProjects, setMappedProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [file, setFile] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [message, setMessage] = useState("");

//   /* ---------------- FETCH PROJECTS ---------------- */

//   useEffect(() => {
//     if (user?.userId) {
//       fetchMappedProjects();
//     }
//   }, [user]);

//   const fetchMappedProjects = async () => {
//     try {
//       const res = await getProjectsMappedToUser({ userId: user.userId });
//       setMappedProjects(res.data.responseObject || []);
//     } catch {
//       setMessage("Failed to load projects");
//     }
//   };

//   /* ---------------- FILE HANDLING ---------------- */

//   const validateFile = (file) => {
//     if (!file) return false;
//     return (
//       file.type ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//       file.type === "application/vnd.ms-excel"
//     );
//   };

//   const handleFileSelect = (file) => {
//     if (!validateFile(file)) {
//       setMessage("Only Excel files (.xls, .xlsx) are allowed");
//       setFile(null);
//       return;
//     }

//     setFile(file);
//     setMessage("");
//     setProgress(0);
//   };

//   /* ---------------- UPLOAD ---------------- */

//   const handleUpload = async () => {
//     if (!file || !selectedProject) {
//       setMessage("Please select project and file");
//       return;
//     }

//     // Mock progress (replace with real API progress)
//     let value = 0;
//     const interval = setInterval(() => {
//       value += 20;
//       setProgress(value);
//       if (value >= 100) {
//         clearInterval(interval);
//         setMessage("File uploaded successfully");
//       }
//     }, 300);
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h5" mb={3}>
//         Upload Project Data
//       </Typography>

//       {/* PROJECT SELECT */}
//       <Box sx={{ maxWidth: 360, mb: 3 }}>
//         <TextField
//           select
//           fullWidth
//           label="Select Project"
//           size="small"
//           value={selectedProject}
//           onChange={(e) => setSelectedProject(e.target.value)}
//         >
//           {mappedProjects.map((project) => (
//             <MenuItem key={project.projectId} value={project.projectCode}>
//               {project.projectName}
//             </MenuItem>
//           ))}
//         </TextField>
//       </Box>

//       {/* UPLOAD CARD */}
//       <Paper
//         elevation={4}
//         sx={{
//           maxWidth: 420,
//           p: 4,
//           textAlign: "center",
//           borderRadius: 3,
//         }}
//       >
//         <FaCloudUploadAlt size={56} color="#1976d2" />

//         <Typography variant="h6" mt={2}>
//           Upload Excel File
//         </Typography>

//         <Typography variant="body2" color="text.secondary" mb={2}>
//           Supported formats: .xls, .xlsx
//         </Typography>

//         <input
//           type="file"
//           accept=".xls,.xlsx"
//           hidden
//           id="excel-upload"
//           onChange={(e) => handleFileSelect(e.target.files[0])}
//         />

//         <label htmlFor="excel-upload">
//           <Button variant="outlined" component="span" sx={{ mt: 1 }}>
//             Browse File
//           </Button>
//         </label>

//         {file && (
//           <Box
//             sx={{
//               mt: 2,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 1,
//               color: "#1976d2",
//               fontWeight: 500,
//             }}
//           >
//             <FaFileExcel />
//             <Typography variant="body2">{file.name}</Typography>
//           </Box>
//         )}

//         {progress > 0 && (
//           <Box sx={{ mt: 2 }}>
//             <LinearProgress variant="determinate" value={progress} />
//           </Box>
//         )}

//         <Button
//           fullWidth
//           variant="contained"
//           sx={{ mt: 3 }}
//           disabled={!file || !selectedProject}
//           onClick={handleUpload}
//         >
//           Upload
//         </Button>

//         {message && (
//           <Typography variant="body2" color="text.secondary" mt={2}>
//             {message}
//           </Typography>
//         )}
//       </Paper>
//     </Box>
//   );
// };

// export default AdminFileUpload;

import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  LinearProgress,
  Stack,
} from "@mui/material";
import { FaFileExcel } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { getProjectsMappedToUser } from "../api/authApi";

const AdminFileUpload = () => {
  const { user } = useContext(AuthContext);

  const [mappedProjects, setMappedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  /* ---------------- FETCH PROJECTS ---------------- */

  useEffect(() => {
    if (user?.userId) fetchMappedProjects();
  }, [user]);

  const fetchMappedProjects = async () => {
    const res = await getProjectsMappedToUser({ userId: user.userId });
    setMappedProjects(res.data.responseObject || []);
  };

  /* ---------------- FILE HANDLING ---------------- */

  const handleFileSelect = (file) => {
    if (!file) return;

    const valid =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (!valid) {
      setMessage("Only Excel files (.xls, .xlsx) allowed");
      return;
    }

    setFile(file);
    setMessage("");
    setProgress(0);
  };

  /* ---------------- UPLOAD ---------------- */

  const handleUpload = () => {
    if (!file || !selectedProject) {
      setMessage("Select project and file");
      return;
    }

    // Mock progress
    let value = 0;
    const interval = setInterval(() => {
      value += 25;
      setProgress(value);
      if (value >= 100) {
        clearInterval(interval);
        setMessage("File uploaded successfully");
      }
    }, 250);
  };

  /* ---------------- UI ---------------- */

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" mb={2}>
        Upload Project File
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          {/* PROJECT SELECT */}
          <TextField
            select
            size="small"
            label="Project"
            sx={{ minWidth: 200 }}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {mappedProjects.map((project) => (
              <MenuItem key={project.projectId} value={project.projectCode}>
                {project.projectName}
              </MenuItem>
            ))}
          </TextField>

          {/* FILE PICKER */}
          <input
            type="file"
            accept=".xls,.xlsx"
            hidden
            id="excel-upload"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          <label htmlFor="excel-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FaFileExcel />}
            >
              Choose File
            </Button>
          </label>

          {/* FILE NAME */}
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {file ? file.name : "No file selected"}
          </Typography>

          {/* UPLOAD */}
          <Button
            variant="contained"
            disabled={!file || !selectedProject}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </Stack>

        {/* PROGRESS */}
        {progress > 0 && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {/* STATUS */}
        {message && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AdminFileUpload;
