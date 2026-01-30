import { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API = "https://child-tracking-backend.onrender.com"; 
// or http://localhost:3000 for local

export default function Signup({ setPage, setEmail }) {
  const [name, setName] = useState("");
  const [email, setEmailInput] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ formData IS DEFINED HERE
      const formData = {
        name,
        email,
        username,
        password
      };

      const res = await axios.post(`${API}/user/signup`, formData);

      // 🔐 DEV ONLY: show OTP (because email not implemented yet)
      if (res.data.otp) {
        alert("Your OTP is: " + res.data.otp);
      }

      setEmail(email);     // store email for OTP verify page
      setPage("verify");   // move to VerifyOtp page
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSignup}>
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmailInput(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p>
          Already have an account?{" "}
          <span onClick={() => setPage("login")}>Login</span>
        </p>
      </form>
    </div>
  );
}
