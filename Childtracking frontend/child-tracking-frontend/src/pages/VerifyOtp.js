import { useState } from "react";
import axios from "axios";

import "../styles/Auth.css";
import API from "../Api";

export default function VerifyOtp({ email, setPage }) {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resendInfo, setResendInfo] = useState("");

  const parseSeconds = (text) => {
    const match = String(text || "").match(/(\d+)\s*s/);
    return match ? Number(match[1]) : 0;
  };

  const verify = async (e) => {
    e.preventDefault();
    setMsg("");
    setResendInfo("");
    try {
      await axios.post(`${API}/user/verify-otp`, { email, otp });
      alert("OTP verified. Please login.");
      setPage("login");
    } catch (err) {
      setMsg(err.response?.data?.error || "Invalid or expired OTP");
    }
  };

  const resendOtp = async () => {
    setMsg("");
    setResendInfo("");
    try {
      const res = await axios.post(`${API}/user/resend-otp`, { email });
      setResendInfo(res.data?.message || "New OTP sent to your Gmail");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const apiError = err.response?.data?.error || "Unable to resend OTP";
      setMsg(apiError);
      const sec = parseSeconds(apiError);
      if (sec > 0) setCooldown(sec);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">Verify OTP</h2>
        <p className="auth-subtitle">{email ? `Code sent to ${email}` : "Enter the verification code"}</p>

        <form onSubmit={verify}>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify</button>
        </form>

        {msg && <p className="error-text">{msg}</p>}
        {resendInfo && <p className="info-text">{resendInfo}</p>}

        <button type="button" className="auth-secondary-btn" onClick={resendOtp} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>

        <p className="auth-link" onClick={() => setPage("login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}
