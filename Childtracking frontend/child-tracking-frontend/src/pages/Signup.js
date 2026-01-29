import { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API = "http://localhost:3000";

export default function Signup({ setPage, setEmail }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(`${API}/user/signup`.trim(), form);
      setEmail(form.email);
      setPage("verify"); // go to OTP page
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Parent Registration</p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Create Account</button>
        </form>

        <p
          style={{ marginTop: "15px", color: "#e0e0e0", cursor: "pointer" }}
          onClick={() => setPage("login")}
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}
