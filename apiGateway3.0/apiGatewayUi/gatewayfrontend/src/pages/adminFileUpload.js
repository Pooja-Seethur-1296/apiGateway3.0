import React, { useState } from "react";
import axios from "axios";
import { FaFileExcel, FaCloudUploadAlt } from "react-icons/fa";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    return allowedTypes.includes(file.type);
  };

  const handleFile = (file) => {
    if (!validateFile(file)) {
      setMessage("❌ Only Excel files are allowed");
      return;
    }
    setFile(file);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/upload-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setMessage("End point Upload successful!");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed, could not update endpoints to the project");
    }
  };

  // Inline styles
  const styles = {
    wrapper: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Segoe UI, sans-serif",
      background: "linear-gradient(135deg, #eef2f3, #dfe9f3)",
    },
    card: {
      background: "#fff",
      width: "420px",
      padding: "30px",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      transition: "0.3s",
      border: dragActive ? "2px dashed #2f58ea" : "none",
      backgroundColor: dragActive ? "#f6fff6" : "#fff",
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
      transition: "0.2s",
    },
    browseBtnHover: {
      background: "#2f58ea",
    },
    filePreview: {
      marginTop: "15px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      color: "#2f58ea",
      fontWeight: "500",
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
      background: "linear-gradient(90deg, #2f58ea, ##2f58ea)",
      transition: "width 0.3s",
      width: `${progress}%`,
    },
    uploadBtn: {
      marginTop: "20px",
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      background: file ? "#2f58ea" : "#bdbdbd",
      color: "white",
      fontSize: "16px",
      cursor: file ? "pointer" : "not-allowed",
    },
    status: {
      marginTop: "10px",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div
        style={styles.card}
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
            <div style={styles.progressInner}></div>
          </div>
        )}

        <button
          style={styles.uploadBtn}
          disabled={!file}
          onClick={handleUpload}
        >
          Upload
        </button>

        {message && <p style={styles.status}>{message}</p>}
      </div>
    </div>
  );
};

export default ExcelUpload;
