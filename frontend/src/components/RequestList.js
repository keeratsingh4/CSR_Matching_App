import React, { useEffect, useState } from "react";
import {
  getRequests,
  shortlistRequest,
  deleteRequest,
  completeRequest
} from "../services/requestService";
import { useAuth } from "../context/AuthContext";

export default function RequestList({ refresh }) {
  const [requests, setRequests] = useState([]);
  const { user, getAuthHeader } = useAuth();

  const loadRequests = async () => {
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [refresh]);

  //  Mark a request as completed
  const handleComplete = async (id) => {
    if (!window.confirm("Mark this request as completed?")) return;
    try {
      await completeRequest(id, getAuthHeader());
      await loadRequests();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  //  Toggle shortlist / unshortlist
  const handleShortlistToggle = async (id) => {
    try {
      const updated = await shortlistRequest(id, getAuthHeader());
      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  //  Delete request (Admin)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await deleteRequest(id, getAuthHeader());
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
      {requests.length === 0 ? (
        <p style={{ fontStyle: "italic" }}>No requests yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {requests.map((r) => {
            const isShortlisted = r.shortlistedBy?.includes(user?._id);

            return (
              <li
                key={r._id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "0.6rem 0",
                  position: "relative",
                  backgroundColor: r.status === "Completed" ? "#f8f9fa" : "white",
                  opacity: r.status === "Completed" ? 0.7 : 1,
                }}
              >
                <b>{r.title}</b>{" "}
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: r.status === "Completed" ? "green" : "#555",
                  }}
                >
                  ({r.status})
                </span>

                {isShortlisted && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      background: "#007bff",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    ✓ Shortlisted
                  </span>
                )}

                <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  {r.description}
                </div>

                <div style={{ fontSize: "0.8rem", color: "#777", marginTop: "0.25rem" }}>
                  Category: {r.category} | By: {r.createdBy?.name || "Unknown"} [
                  {r.createdBy?.role || "N/A"}]
                </div>

                <div style={{ fontSize: "0.85rem", color: "#333", marginTop: "0.4rem" }}>
                  Shortlisted: <b>{r.shortlistedCount || 0}</b>
                </div>

                {/*  Shortlist button for CSR_REP */}
                {user?.role === "CSR_REP" && (
                  <button
                    onClick={() => handleShortlistToggle(r._id)}
                    style={{
                      marginTop: "0.4rem",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                      backgroundColor: isShortlisted ? "#6c757d" : "#007bff",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {isShortlisted ? "Unshortlist" : "Shortlist"}
                  </button>
                )}

                {/*  Mark Complete button (Admin or CSR_REP) */}
                {["ADMIN", "CSR_REP"].includes(user?.role) &&
                  r.status !== "Completed" && (
                    <button
                      onClick={() => handleComplete(r._id)}
                      style={{
                        marginTop: "0.4rem",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "4px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "0.5rem",
                      }}
                    >
                      ✅ Mark Completed
                    </button>
                  )}

                {/*  Delete button (Admin only) */}
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => handleDelete(r._id)}
                    style={{
                      marginTop: "0.4rem",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "0.5rem",
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
