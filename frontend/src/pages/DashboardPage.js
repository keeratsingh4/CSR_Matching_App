import React, { useState, useEffect } from "react";
import RequestList from "../components/RequestList";
import RequestForm from "../components/RequestForm";
import { useAuth } from "../context/AuthContext";
import { getLatestNotification } from "../services/notificationService";

export default function DashboardPage() {
  const { user, getAuthHeader } = useAuth();
  const [refresh, setRefresh] = useState(false);
  const [notification, setNotification] = useState(null);

  //  Fetch latest broadcast notification
  useEffect(() => {
    let timer;

    const fetchNotification = async () => {
      try {
        const data = await getLatestNotification(getAuthHeader());
        setNotification(data);

        //  Auto-hide banner after 15 seconds
        if (data) {
          clearTimeout(timer);
          timer = setTimeout(() => setNotification(null), 15000);
        }
      } catch (err) {
        console.error("Error fetching notification:", err);
      }
    };

    fetchNotification();

    //  Refresh every 30 seconds
    const interval = setInterval(fetchNotification, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [getAuthHeader]);

  const handleRequestCreated = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div
      style={{
        padding: "2rem",
        background: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#007bff",
          marginBottom: "2rem",
          fontWeight: "700",
        }}
      >
        Welcome, {user?.name} 
      </h1>

      {/*  Broadcast Notification Banner */}
      {notification && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            position: "relative",
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <strong>Announcement:</strong> {notification.message}
          {notification.createdBy?.name && (
            <span
              style={{
                fontSize: "0.9rem",
                marginLeft: "8px",
                color: "#555",
              }}
            >
              — {notification.createdBy.name}
            </span>
          )}

          {/*  Dismiss Button */}
          <button
            onClick={() => setNotification(null)}
            style={{
              position: "absolute",
              top: "6px",
              right: "10px",
              background: "transparent",
              border: "none",
              fontSize: "1.2rem",
              color: "#856404",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/*  Dashboard Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: user?.role === "PIN" ? "1fr 1fr" : "1fr",
          gap: "2rem",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Request list */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#333" }}>Active Requests</h2>
          <RequestList refresh={refresh} />
        </div>

        {/* Only PIN users can create requests */}
        {user?.role === "PIN" && (
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ color: "#333" }}>Create New Request</h2>
            <RequestForm onRequestCreated={handleRequestCreated} />
          </div>
        )}
      </div>
    </div>
  );
}
