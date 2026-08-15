import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaTractor, FaKey, FaEye, FaEyeSlash, FaUserCheck, FaUserTie, FaUserShield } from "react-icons/fa";
import { loginUser } from "../services/authService";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotErr, setForgotErr] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login Successful! Redirecting to Dashboard...");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "owner") {
          navigate("/owner-dashboard");
        } else {
          navigate("/customer-dashboard");
        }
      }, 400);
    } catch (error) {
      console.error("Login error:", error);
      setIsError(true);
      const errRes = error.response?.data;
      if (errRes) {
        const msg = errRes.non_field_errors?.[0] || errRes.detail || errRes.error || "Invalid Email or Password. Please try again.";
        setMessage(msg);
      } else {
        setMessage("Network connection error. Please check your backend server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    setForgotErr("");
    try {
      const res = await api.post("accounts/forgot-password/", { email: forgotEmail });
      setForgotMsg(res.data.message);
      if (res.data.dev_code) setResetCode(res.data.dev_code);
      setForgotStep(2);
    } catch (err) {
      setForgotErr(err.response?.data?.error || "Email address not found.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    setForgotErr("");
    try {
      const res = await api.post("accounts/reset-password/", {
        email: forgotEmail,
        code: resetCode,
        new_password: newPassword,
      });
      setForgotMsg(res.data.message);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setMessage("Password reset successfully! Log in with your new password.");
        setIsError(false);
      }, 1500);
    } catch (err) {
      setForgotErr(err.response?.data?.error || "Invalid reset code or input.");
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 120px)" }}>
        <div className="card glass-card border-0 p-4 p-md-5 shadow-lg w-100" style={{ maxWidth: 460 }}>
          <div className="text-center mb-4">
            <div className="bg-success text-white p-3 rounded-circle d-inline-flex mb-2">
              <FaTractor className="fs-3" />
            </div>
            <h3 className="fw-extrabold text-dark m-0">Login to TRACTO</h3>
            <p className="text-muted small">Access your tractor rental bookings & fleet</p>
          </div>

          {/* Quick 1-Click Demo Credentials Filler */}
          <div className="bg-light p-2.5 rounded-3 mb-4 border">
            <div className="text-muted small fw-bold mb-2 text-center">⚡ Quick Demo One-Click Login:</div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-success btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.75rem" }}
                onClick={() => handleQuickFill("customer@tracto.com", "customer123")}
              >
                <FaUserCheck /> Customer
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.75rem" }}
                onClick={() => handleQuickFill("owner@tracto.com", "owner123")}
              >
                <FaUserTie /> Owner
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.75rem" }}
                onClick={() => handleQuickFill("admin@tracto.com", "admin123")}
              >
                <FaUserShield /> Admin
              </button>
            </div>
          </div>

          {message && (
            <div className={`alert ${isError ? "alert-danger" : "alert-success"} p-2.5 small text-center mb-4 rounded-3`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold small text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-end mb-4">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-success text-decoration-none small fw-semibold"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotMsg("");
                  setForgotErr("");
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn btn-tracto-primary w-100 py-2.5 rounded-pill fw-bold" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top small text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-success fw-bold text-decoration-none">
              Register Here
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaKey className="text-warning" /> Reset Password
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowForgotModal(false)}></button>
              </div>

              <div className="modal-body pt-3">
                {forgotMsg && <div className="alert alert-success p-2 small">{forgotMsg}</div>}
                {forgotErr && <div className="alert alert-danger p-2 small">{forgotErr}</div>}

                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestCode}>
                    <p className="text-muted small">Enter your registered email address to receive a password reset code.</p>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-tracto-primary w-100 rounded-pill py-2">
                      Send Reset Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Reset Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter 6-digit code"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-pill py-2">
                      Reset Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;