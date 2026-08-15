import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaTractor, FaKey, FaEye, FaEyeSlash, FaUserCheck, FaUserTie, FaUserShield, FaRobot, FaCheckCircle, FaStar, FaShieldAlt } from "react-icons/fa";
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
    <div className="auth-bg min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="container my-auto py-4">
        <div className="row g-0 justify-content-center align-items-stretch shadow-lg rounded-5 overflow-hidden border border-white">
          {/* Left Column: Visual Hero Section */}
          <div className="col-lg-6 login-hero-card p-4 p-md-5 d-none d-lg-flex flex-column justify-content-between position-relative z-1">
            <div>
              <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold mb-4 d-inline-flex align-items-center gap-2">
                <FaTractor /> #1 Agricultural Rental Platform
              </span>
              <h1 className="display-6 fw-bold text-white mb-3">
                Empowering Farmers & Equipment Owners Across Gujarat 🚜
              </h1>
              <p className="text-light opacity-90 fs-6 mb-4">
                ખેડૂતો માટે સરળ ટ્રેક્ટર અને ઓજારોનું ભાડું, પારદર્શક ગણતરી અને AI દ્વારા શ્રેષ્ઠ ટ્રેક્ટર સુઝાવ.
              </p>

              {/* Key Highlights */}
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3 bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur">
                  <div className="bg-success p-2 rounded-circle text-white mt-1">
                    <FaRobot className="fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Smart AI Matcher Engine</h6>
                    <small className="text-light opacity-80">
                      પાક અને એકર મુજબ યોગ્ય HP ટ્રેક્ટર, ઓજારો અને ડીઝલનો સચોટ અંદાજ.
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur">
                  <div className="bg-warning text-dark p-2 rounded-circle mt-1">
                    <FaShieldAlt className="fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Verified Fleet & Secure Bookings</h6>
                    <small className="text-light opacity-80">
                      100% ચકાસાયેલા ટ્રેક્ટર માલિકો, સુરક્ષિત પેમેન્ટ્સ અને રિયલ-ટાઈમ સ્ટેટસ.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats Footer */}
            <div className="pt-4 border-top border-white border-opacity-20 d-flex justify-content-between text-center">
              <div>
                <div className="fs-4 fw-extrabold text-white">500+</div>
                <div className="small text-light opacity-75">Verified Fleet</div>
              </div>
              <div className="border-end border-white border-opacity-20"></div>
              <div>
                <div className="fs-4 fw-extrabold text-white">10,000+</div>
                <div className="small text-light opacity-75">Happy Farmers</div>
              </div>
              <div className="border-end border-white border-opacity-20"></div>
              <div>
                <div className="fs-4 fw-extrabold text-warning d-flex align-items-center justify-content-center gap-1">
                  4.9 <FaStar className="fs-6" />
                </div>
                <div className="small text-light opacity-75">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphism Login Form */}
          <div className="col-lg-6 login-glass-box p-4 p-md-5 d-flex flex-column justify-content-center">
            <div className="text-center mb-4">
              <div className="bg-success text-white p-3 rounded-circle d-inline-flex mb-2 shadow-sm">
                <FaTractor className="fs-3" />
              </div>
              <h2 className="fw-bold text-dark m-0">Welcome Back! 👋</h2>
              <p className="text-muted small mt-1">Sign in to manage your tractor bookings & fleet</p>
            </div>

            {/* Quick 1-Click Demo Login Bar */}
            <div className="bg-light p-3 rounded-4 mb-4 border border-secondary-subtle">
              <div className="text-dark small fw-bold mb-2 text-center d-flex align-items-center justify-content-center gap-1">
                <span>⚡ 1-Click Quick Demo Sign In:</span>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm flex-fill rounded-pill demo-role-btn d-flex align-items-center justify-content-center gap-1 py-1.5 fw-bold"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => handleQuickFill("customer@tracto.com", "customer123")}
                >
                  <FaUserCheck /> Farmer
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm flex-fill rounded-pill demo-role-btn d-flex align-items-center justify-content-center gap-1 py-1.5 fw-bold"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => handleQuickFill("owner@tracto.com", "owner123")}
                >
                  <FaUserTie /> Owner
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm flex-fill rounded-pill demo-role-btn d-flex align-items-center justify-content-center gap-1 py-1.5 fw-bold"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => handleQuickFill("admin@tracto.com", "admin123")}
                >
                  <FaUserShield /> Admin
                </button>
              </div>
            </div>

            {message && (
              <div className={`alert ${isError ? "alert-danger" : "alert-success"} p-3 small text-center mb-4 rounded-4 shadow-sm`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-secondary">Email Address</label>
                <div className="input-group input-group-modern border">
                  <span className="input-group-text bg-white text-success border-0 px-3">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-0 ps-0 py-2.5"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold small text-secondary">Password</label>
                <div className="input-group input-group-modern border">
                  <span className="input-group-text bg-white text-success border-0 px-3">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control border-0 ps-0 py-2.5"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-link text-muted border-0 pe-3 text-decoration-none"
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
                  className="btn btn-link btn-sm p-0 text-success text-decoration-none small fw-bold"
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

              <button
                type="submit"
                className="btn btn-success btn-lg w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Sign In to Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top small text-muted">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-success fw-extrabold text-decoration-none">
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaKey className="text-warning" /> Reset Password
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowForgotModal(false)}></button>
              </div>

              <div className="modal-body pt-3">
                {forgotMsg && <div className="alert alert-success p-2.5 small rounded-3">{forgotMsg}</div>}
                {forgotErr && <div className="alert alert-danger p-2.5 small rounded-3">{forgotErr}</div>}

                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestCode}>
                    <p className="text-muted small">Enter your registered email address to receive a password reset code.</p>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-pill py-2.5 fw-bold">
                      Send Reset Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Reset Code</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
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
                        className="form-control rounded-3"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-pill py-2.5 fw-bold">
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