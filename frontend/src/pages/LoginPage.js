import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PIN");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (mode === "login") {
        data = await loginUser(email, password);
      } else {
        data = await registerUser(name, email, password, role);
      }
      login(data);
      navigate("/dashboard");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #007bff, #00c6ff)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          width: "360px",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#007bff", marginBottom: "1rem" }}>
          {mode === "login" ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {mode === "register" && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                ...inputStyle,
                cursor: "pointer",
              }}
            >
              <option value="PIN">Person in Need (PIN)</option>
              <option value="CSR_REP">CSR Representative</option>
              <option value="CORPORATE_VOLUNTEER">Corporate Volunteer</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}

          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
              marginTop: "0.8rem",
              fontWeight: "bold",
            }}
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer", fontWeight: 600 }}
                onClick={() => setMode("register")}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#007bff", cursor: "pointer", fontWeight: 600 }}
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  marginBottom: "0.8rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};
