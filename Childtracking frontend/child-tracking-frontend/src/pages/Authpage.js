import { useState } from "react";
import axios from "axios";

export default function AuthPage({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      const url = isLogin
        ? "https://child-tracking-backend.onrender.com/user/login"
        : "https://child-tracking-backend.onrender.com/user/signup";

      const res = await axios.post(url, { username, password });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else {
        alert("Signup successful. Please login.");
        setIsLogin(true);
      }
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>{isLogin ? "Parent Login" : "Create Account"}</h2>

        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="error">{error}</p>}

        <button onClick={submit}>
          {isLogin ? "Login" : "Signup"}
        </button>

        <p className="toggle" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create new account" : "Already have an account?"}
        </p>
      </div>
    </div>
  );
}
