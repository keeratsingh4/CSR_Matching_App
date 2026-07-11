import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toggleUserSuspend } from "../services/adminService";
import { broadcastNotification } from "../services/notificationService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [reportData, setReportData] = useState(null);
  const [users, setUsers] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const { getAuthHeader } = useAuth();

  // Load reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/summary", {
          headers: getAuthHeader(),
        });
        setReportData(res.data);
      } catch (err) {
        console.error("Error loading report:", err);
      }
    };
    fetchReports();
  }, [getAuthHeader]);

  // Load users
  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: getAuthHeader(),
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to change this user’s status?")) return;
    try {
      await toggleUserSuspend(id, getAuthHeader());
      await loadUsers();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  //  Handle Broadcast Form Submission
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return alert("Please enter a message.");

    try {
      await broadcastNotification(broadcastMsg, expiresAt, getAuthHeader());
      alert("📢 Broadcast sent successfully!");
      setBroadcastMsg("");
      setExpiresAt("");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (!reportData)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading admin dashboard...</p>;

  // Chart setup
  const categories = Object.keys(reportData.requestsPerCategory);
  const counts = Object.values(reportData.requestsPerCategory);
  const shortlistCounts = Object.values(reportData.shortlistsPerCategory || {});

  const barData = {
    labels: categories,
    datasets: [
      {
        label: "Requests per Category",
        data: counts,
        backgroundColor: "#007bff88",
        borderColor: "#007bff",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: categories,
    datasets: [
      {
        label: "Shortlists per Category",
        data: shortlistCounts,
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Total Requests: ${reportData.totalRequests}`,
        font: { size: 16 },
      },
      legend: { position: "bottom" },
    },
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#007bff" }}>
        Platform Administrator Dashboard
      </h2>

      {/* Reports Section */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "3rem",
        }}
      >
        <h3 style={{ color: "#333" }}>Reports Overview</h3>
        <Bar data={barData} options={options} />
        <div style={{ marginTop: "3rem" }}>
          <h3 style={{ color: "#333" }}>Shortlists per Category</h3>
          <Pie
            data={pieData}
            options={{ plugins: { legend: { position: "bottom" } } }}
          />
        </div>
      </div>

      {/* User Management Section */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "3rem",
        }}
      >
        <h3 style={{ color: "#333", marginBottom: "1rem" }}>User Management</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem",
          }}
        >
          <thead>
            <tr style={{ background: "#007bff", color: "white" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.role}</td>
                <td
                  style={{
                    ...tdStyle,
                    color: u.status === "suspended" ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {u.status}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleSuspend(u._id)}
                    style={{
                      background: u.status === "suspended" ? "#28a745" : "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.4rem 0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {u.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*  Broadcast Notification Form */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#333", marginBottom: "1rem" }}>
          Send Broadcast Notification
        </h3>

        <form onSubmit={handleBroadcast} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Enter broadcast message"
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            required
          />

          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          <button
            type="submit"
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "0.6rem",
  textAlign: "left",
};

const tdStyle = {
  padding: "0.6rem",
};
