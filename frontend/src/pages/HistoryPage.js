import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function HistoryPage() {
  const { getAuthHeader } = useAuth();
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    from: "",
    to: "",
  });

  const loadHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);

      const res = await API.get(`/requests/history?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", color: "#007bff" }}>Service History</h2>

      {/* Filter Section */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
          justifyContent: "center",
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          style={{ padding: "0.5rem", borderRadius: "4px" }}
        >
          <option value="">All Service Types</option>
          <option>Medical Escort</option>
          <option>Mobility Aid</option>
          <option>Daily Living Support</option>
          <option>Other</option>
        </select>

        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={handleFilterChange}
          style={{ padding: "0.5rem", borderRadius: "4px" }}
        />

        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={handleFilterChange}
          style={{ padding: "0.5rem", borderRadius: "4px" }}
        />

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Filter
        </button>
      </form>

      {/* Results */}
      {history.length === 0 ? (
        <p style={{ textAlign: "center", fontStyle: "italic" }}>
          No completed services found.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#007bff", color: "white" }}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Service Type</th>
              <th style={thStyle}>Volunteer</th>
              <th style={thStyle}>Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r._id}>
                <td style={tdStyle}>{r.title}</td>
                <td style={tdStyle}>{r.category}</td>
                <td style={tdStyle}>{r.matchedTo?.name || "N/A"}</td>
                <td style={tdStyle}>
                  {r.completedAt
                    ? new Date(r.completedAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "0.75rem",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid #eee",
};
