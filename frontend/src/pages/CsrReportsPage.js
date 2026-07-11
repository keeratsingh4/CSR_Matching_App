import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function CsrReportsPage() {
  const { getAuthHeader } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.from && filters.to) {
        params.append("startDate", filters.from);
        params.append("endDate", filters.to);
      }

      const res = await API.get(`/hour-logs/company-report?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      setReport(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load company report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadReport();
  };

  if (loading) return <div style={styles.loading}>Loading report...</div>;

  return (
    <div style={styles.container}>
      <h2>Company Volunteer Hour Report</h2>

      {/* Filters */}
      <form onSubmit={handleSubmit} style={styles.filterForm}>
        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>
          Apply Filter
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {report && (
        <>
          {/* Summary Cards */}
          <div style={styles.summary}>
            <div style={styles.card}>
              <h3>{report.count}</h3>
              <p>Total Logs</p>
            </div>
            <div style={styles.card}>
              <h3>{report.totalHours.toFixed(1)}</h3>
              <p>Total Hours</p>
            </div>
            <div style={styles.card}>
              <h3>{report.verifiedHours.toFixed(1)}</h3>
              <p>Verified Hours</p>
            </div>
          </div>

          {/* Table */}
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "#007bff", color: "white" }}>
                <th style={styles.th}>Volunteer</th>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Hours</th>
                <th style={styles.th}>Verified</th>
              </tr>
            </thead>
            <tbody>
              {report.hourLogs.map((log) => (
                <tr key={log._id}>
                  <td style={styles.td}>{log.volunteerId?.name}</td>
                  <td style={styles.td}>{log.taskId?.title}</td>
                  <td style={styles.td}>{log.taskId?.category}</td>
                  <td style={styles.td}>{log.hours}</td>
                  <td style={styles.td}>
                    {log.verified ? " Yes" : " Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "1000px", margin: "auto" },
  loading: { textAlign: "center", padding: "50px" },
  filterForm: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  input: { padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" },
  btn: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "2rem",
  },
  card: {
    background: "#4CAF50",
    color: "white",
    padding: "1.5rem",
    textAlign: "center",
    borderRadius: "8px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.75rem" },
  td: { padding: "0.75rem", borderBottom: "1px solid #ddd" },
  error: { backgroundColor: "#f44336", color: "white", padding: "1rem" },
};
