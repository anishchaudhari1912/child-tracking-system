import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [page, setPage] = useState("signup");
  const [email, setEmail] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <>
      {/* MAIN APP CONTENT */}
      {token ? (
        <Dashboard setToken={setToken} />
      ) : page === "signup" ? (
        <Signup setPage={setPage} setEmail={setEmail} />
      ) : page === "verify" ? (
        <VerifyOtp setPage={setPage} email={email} />
      ) : (
        <Login setToken={setToken} />
      )}

      {/* ✅ TOAST CONTAINER (GLOBAL) */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
