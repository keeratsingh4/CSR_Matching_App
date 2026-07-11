import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Don’t render if not logged in
  if (!user) return null;

  const goTo = (path) => navigate(path);

  return (
    <nav
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "0.8rem 1.2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      {/* Left section */}
      <div
        style={{
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1.2rem",
        }}
        onClick={() => goTo("/dashboard")}
      >
        CSR Matching Platform
      </div>

      {/* Middle section */}
      <div>
        {/* Dashboard - visible to all */}
        <button onClick={() => goTo("/dashboard")} style={navBtnStyle}>
          🏠 Dashboard
        </button>

        {/* Admin Dashboard */}
        {user.role === "ADMIN" && (
          <button onClick={() => goTo("/admin-dashboard")} style={navBtnStyle}>
            📊 Admin Dashboard
          </button>
        )}

        {/* PIN User History */}
        {user.role === "PIN" && (
          <button onClick={() => goTo("/history")} style={navBtnStyle}>
            📜 My History
          </button>
        )}

        {/* CSR Representative Section */}
        {user.role === "CSR_REP" && (
          <>
            <button onClick={() => goTo("/csr-dashboard")} style={navBtnStyle}>
              📋 CSR Dashboard
            </button>
            <button onClick={() => goTo("/csr-verify")} style={navBtnStyle}>
              ✅ Verify Hours
            </button>
            <button onClick={() => goTo("/csr-reports")} style={navBtnStyle}>
              📈 Reports
            </button>
          </>
        )}

        {/* Corporate Volunteer Section */}
        {user.role === "CORPORATE_VOLUNTEER" && (
          <>
            <button
              onClick={() => goTo("/volunteer-dashboard")}
              style={navBtnStyle}
            >
              📋 My Tasks
            </button>
            <button
              onClick={() => goTo("/volunteer-history")}
              style={navBtnStyle}
            >
              📜 My History
            </button>
          </>
        )}

        {/* Role label */}
        <span style={{ fontSize: "0.9rem", marginLeft: "0.75rem" }}>
          {user.role === "PIN" && "👤 Person-in-Need"}
          {user.role === "CSR_REP" && "🤝 CSR Rep"}
          {user.role === "ADMIN" && "🛠️ Admin"}
          {user.role === "CORPORATE_VOLUNTEER" && "🎯 Volunteer"}
        </span>
      </div>

      {/* Right section */}
      <div>
        <span style={{ marginRight: "1rem" }}>Hi, {user.name}</span>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// Reusable button style
const navBtnStyle = {
  backgroundColor: "white",
  color: "#007bff",
  border: "none",
  borderRadius: "5px",
  padding: "0.4rem 0.8rem",
  marginRight: "0.5rem",
  cursor: "pointer",
  fontWeight: "bold",
};
