import { useState } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function VerifyOtp({ email, setPage }) {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const verify = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/user/verify-otp`, { email, otp });
      alert("OTP verified. Please login.");
      setPage("login");
    } catch (err) {
      setMsg("Invalid or expired OTP");
    }
  };

  return (
    <div className="auth-box">
      <h2>Verify OTP</h2>
      <form onSubmit={verify}>
        <input placeholder="Enter OTP" onChange={e => setOtp(e.target.value)} />
        <button>Verify</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
