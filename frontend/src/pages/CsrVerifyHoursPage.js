import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function CsrVerifyHoursPage() {
  const { getAuthHeader } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/hour-logs", { headers: getAuthHeader() });
      setLogs(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch volunteer hour logs");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Verify this volunteer’s logged hours?")) return;
    try {
      await API.post(`/hour-logs/${id}/verify`, {}, { headers: getAuthHeader() });
      alert("Hours verified successfully!");
      loadLogs();
    } catch (err) {
      alert("Failed to verify hours");
    }
  };

  const handleDispute = async (id) => {
    const reason = prompt("Enter reason for dispute:");
    if (!reason) return;
    try {
      await API.post(`/hour-logs/${id}/dispute`, { disputeReason: reason }, { headers: getAuthHeader() });
      alert("Dispute submitted successfully!");
      loadLogs();
    } catch (err) {
      alert("Failed to dispute hours");
    }
  };

  if (loading) return <div style={styles.loading}>Loading volunteer logs...</div>;

  return (
    <div style={styles.container}>
      <h2>Volunteer Hour Verification</h2>
      {error && <div style={styles.error}>{error}</div>}

      {logs.length === 0 ? (
        <p style={{ textAlign: "center" }}>No volunteer hour logs available.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Volunteer</th>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Hours</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={styles.td}>{log.volunteerId?.name}</td>
                <td style={styles.td}>{log.taskId?.title}</td>
                <td style={styles.td}>{log.taskId?.category}</td>
                <td style={styles.td}>{log.hours} hrs</td>
                <td style={styles.td}>
                  {log.verified ? (
                    <span style={{ ...styles.badge, background: "#28a745" }}>Verified</span>
                  ) : (
                    <span style={{ ...styles.badge, background: "#ffc107" }}>Pending</span>
                  )}
                </td>
                <td style={styles.td}>
                  {!log.verified ? (
                    <>
                      <button style={styles.verifyBtn} onClick={() => handleVerify(log._id)}>
                         Verify
                      </button>
                      <button style={styles.disputeBtn} onClick={() => handleDispute(log._id)}>
                         Dispute
                      </button>
                    </>
                  ) : (
                    <em>—</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "1000px", margin: "auto" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
  th: { background: "#007bff", color: "white", padding: "0.75rem", textAlign: "left" },
  td: { padding: "0.75rem", borderBottom: "1px solid #ddd" },
  headerRow: { background: "#007bff" },
  badge: { color: "white", padding: "5px 10px", borderRadius: "8px", fontSize: "0.85rem" },
  verifyBtn: {
    background: "#28a745",
    color: "white",
    border: "none",
    padding: "0.4rem 0.6rem",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "5px",
  },
  disputeBtn: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "0.4rem 0.6rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  loading: { textAlign: "center", padding: "50px" },
  error: { backgroundColor: "#f44336", color: "white", padding: "1rem", borderRadius: "6px" },
};
