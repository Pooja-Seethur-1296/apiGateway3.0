import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaFileExcel, FaCloudUploadAlt } from "react-icons/fa";

const Adminfileupload = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!validateFile(file)) {
      setMessage("❌ Only Excel files are allowed");
      return;
    }
    setFile(file);
    setMessage("");
  };

  const validateFile = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    return allowedTypes.includes(file.type);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file first");
      return;
    }

    // TODO: implement API upload
    setMessage("✅ File ready to upload");
  };

  return (
    <main style={styles.main}>
      <div style={styles.uploadWrapper}>
        <div
          style={{
            ...styles.uploadCard,
            border: dragActive
              ? "2px dashed #2f58ea"
              : "2px dashed transparent",
            background: dragActive ? "#f6fff6" : "#fff",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <FaCloudUploadAlt style={styles.uploadIcon} />
          <h3>Upload Excel File</h3>
          <p>Drag & drop your Excel file here</p>

          <input
            type="file"
            accept=".xls,.xlsx"
            hidden
            id="excelUpload"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <label htmlFor="excelUpload" style={styles.browseBtn}>
            Browse File
          </label>

          {file && (
            <div style={styles.filePreview}>
              <FaFileExcel />
              <span>{file.name}</span>
            </div>
          )}

          {progress > 0 && (
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressInner, width: `${progress}%` }} />
            </div>
          )}

          <button
            style={{
              ...styles.uploadBtn,
              background: file ? "#2f58ea" : "#bdbdbd",
            }}
            disabled={!file}
            onClick={handleUpload}
          >
            Upload
          </button>

          {message && <p style={styles.status}>{message}</p>}
        </div>
      </div>
    </main>
  );
};

const styles = {
  main: {
    padding: "25px",
  },

  welcomeText: {
    fontSize: "16px",
    fontWeight: 500,
    marginBottom: "20px",
    color: "#334155",
  },

  uploadWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
  },

  uploadCard: {
    width: "420px",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "0.3s",
  },

  uploadIcon: {
    fontSize: "60px",
    color: "#2f58ea",
  },

  browseBtn: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 22px",
    borderRadius: "8px",
    background: "#2f58ea",
    color: "white",
    cursor: "pointer",
  },

  filePreview: {
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#2f58ea",
    fontWeight: 500,
  },

  progressBar: {
    marginTop: "15px",
    height: "8px",
    background: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressInner: {
    height: "100%",
    background: "#2f58ea",
    transition: "width 0.3s",
  },

  uploadBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  status: {
    marginTop: "10px",
    fontWeight: 500,
  },
};

export default Adminfileupload;
