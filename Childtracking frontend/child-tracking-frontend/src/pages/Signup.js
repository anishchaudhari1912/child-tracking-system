import { useState } from "react";
import axios from "axios";
import "../styles/Auth.css";   // ✅ THIS MUST EXIST

const API = "https://child-tracking-backend.onrender.com";

export default function Signup({ setPage, setEmail }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API}/user/signup`, form);

      // DEV ONLY – OTP shown because email not implemented
      alert("Your OTP is: " + res.data.otp);

      setEmail(res.data.email);
      setPage("verify");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Child Tracking System</p>

        {error && <p className="error-text">{error}</p>}

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button onClick={handleSignup}>Sign Up</button>

        <p
          style={{ marginTop: "15px", color: "#fff", cursor: "pointer" }}
          onClick={() => setPage("login")}
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}
