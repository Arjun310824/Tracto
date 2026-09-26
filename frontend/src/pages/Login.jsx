import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaLock,
  FaEnvelope,
  FaTractor,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaRobot,
  FaStar,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { loginUser } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage("");
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
        const msg =
          errRes.non_field_errors?.[0] ||
          errRes.detail ||
          errRes.error ||
          "Invalid Email or Password. Please try again.";
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
    setForgotLoading(true);
    try {
      const res = await api.post("accounts/forgot-password/", { email: forgotEmail.trim() });
      setForgotMsg(res.data.message || "Reset code sent successfully.");
      if (res.data.dev_code) setResetCode(res.data.dev_code);
      setForgotStep(2);
    } catch (err) {
      setForgotErr(err.response?.data?.error || "Email address not found.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    setForgotErr("");
    setForgotLoading(true);
    try {
      const res = await api.post("accounts/reset-password/", {
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        new_password: newPassword,
      });
      setForgotMsg(res.data.message || "Password reset successfully!");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setMessage("Password reset successfully! Log in with your new password.");
        setIsError(false);
      }, 1500);
    } catch (err) {
      setForgotErr(err.response?.data?.error || "Invalid reset code or input.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <main className="container my-auto py-4 py-md-5 px-3">
        <div className="row g-0 justify-content-center align-items-stretch shadow-lg rounded-4 overflow-hidden border bg-white" style={{ borderColor: "var(--border-subtle)" }}>
          {/* Left Column: Visual Hero Section (Desktop/Tablet) */}
          <div
            className="col-lg-6 p-4 p-md-5 d-none d-lg-flex flex-column justify-content-between text-white position-relative"
            style={{
              background: "linear-gradient(145deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
            }}
          >
            <div>
              <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 text-white px-3.5 py-1.5 rounded-pill fw-bold small mb-4 backdrop-blur border border-white border-opacity-25 shadow-sm">
                <FaTractor className="text-warning" /> #1 Agricultural Equipment Network
              </div>
              <h1 className="display-6 fw-extrabold text-white mb-3 lh-sm">
                {t("heroTitle") || "Powering Modern Indian Agriculture"}
              </h1>
              <p className="text-light opacity-90 fs-6 mb-4 leading-relaxed">
                {t("heroSub") || "Connect directly with verified local tractor owners, hire advanced machinery per hour or day, and boost your harvest productivity."}
              </p>

              {/* Value Highlights */}
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3 bg-white bg-opacity-10 p-3.5 rounded-3 backdrop-blur border border-white border-opacity-15 shadow-sm">
                  <div className="bg-warning text-dark p-2.5 rounded-circle mt-0.5 shadow-sm flex-shrink-0">
                    <FaShieldAlt className="fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">{t("verifiedFleetHighlight") || "100% Verified Fleet"}</h6>
                    <small className="text-light opacity-80 leading-normal d-block">
                      {t("verifiedFleetSub") || "Every tractor inspected for peak mechanical performance and GPS tracked."}
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 bg-white bg-opacity-10 p-3.5 rounded-3 backdrop-blur border border-white border-opacity-15 shadow-sm">
                  <div className="bg-success text-white p-2.5 rounded-circle mt-0.5 shadow-sm border border-white border-opacity-25 flex-shrink-0">
                    <FaRobot className="fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">{t("aiMatcherHighlight") || "Smart AI Equipment Matcher"}</h6>
                    <small className="text-light opacity-80 leading-normal d-block">
                      {t("aiMatcherSub") || "Recommends the best horsepower and implement for your soil type and crop."}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="pt-4 border-top border-white border-opacity-20 d-flex justify-content-between text-center">
              <div>
                <div className="fs-4 fw-extrabold text-white">500+</div>
                <div className="small text-light opacity-75">Verified Fleet</div>
              </div>
              <div className="border-end border-white border-opacity-20" />
              <div>
                <div className="fs-4 fw-extrabold text-white">10,000+</div>
                <div className="small text-light opacity-75">Happy Farmers</div>
              </div>
              <div className="border-end border-white border-opacity-20" />
              <div>
                <div className="fs-4 fw-extrabold text-warning d-flex align-items-center justify-content-center gap-1">
                  4.9 <FaStar className="fs-6" />
                </div>
                <div className="small text-light opacity-75">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Form */}
          <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center bg-white">
            <div className="text-center mb-4">
              <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-flex mb-2 shadow-sm border border-success-subtle">
                <FaTractor className="fs-3" />
              </div>
              <h2 className="fw-extrabold text-dark m-0">{t("welcomeBack") || "Welcome Back"}</h2>
              <p className="text-muted small mt-1">{t("loginSubtitle") || "Log in to your TRACTO account to manage rentals"}</p>
            </div>

            {message && (
              <div
                className={`p-3 small text-center mb-4 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                  isError
                    ? "bg-danger-subtle text-danger border border-danger-subtle"
                    : "bg-success-subtle text-success border border-success-subtle"
                }`}
                role="alert"
              >
                {isError ? <FaExclamationCircle /> : <FaCheckCircle />}
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Input
                label={t("emailAddress") || "Email Address"}
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                icon={<FaEnvelope />}
                required
                autoComplete="email"
              />

              <Input
                label={t("password") || "Password"}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                icon={<FaLock />}
                required
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    className="btn btn-link text-muted border-0 p-0 text-decoration-none"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />

              <div className="text-end mb-4">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-success text-decoration-none fw-semibold"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotMsg("");
                    setForgotErr("");
                  }}
                >
                  {t("forgotPassword") || "Forgot Password?"}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                loadingText="Signing In..."
                icon={<FaCheckCircle />}
              >
                {t("signInBtn") || "Sign In to Account"}
              </Button>
            </form>

            <div className="text-center mt-4 pt-3 border-top small text-muted">
              {t("noAccount") || "Don't have an account?"}{" "}
              <Link to="/register" className="text-success fw-bold text-decoration-none">
                {t("registerHere") || "Register Here"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Account Password"
        icon={<FaKey className="text-warning" />}
        size="md"
      >
        {forgotMsg && (
          <div className="alert alert-success p-2.5 small rounded-3 mb-3 d-flex align-items-center gap-2">
            <FaCheckCircle />
            <span>{forgotMsg}</span>
          </div>
        )}
        {forgotErr && (
          <div className="alert alert-danger p-2.5 small rounded-3 mb-3 d-flex align-items-center gap-2">
            <FaExclamationCircle />
            <span>{forgotErr}</span>
          </div>
        )}

        {forgotStep === 1 ? (
          <form onSubmit={handleRequestCode}>
            <p className="text-muted small mb-3">
              Enter your registered email address to receive a secure password reset code.
            </p>
            <Input
              label="Email Address"
              type="email"
              placeholder="farmer@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              icon={<FaEnvelope />}
              required
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={forgotLoading}
              loadingText="Sending Code..."
            >
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <Input
                label="Reset Code"
                type="text"
                placeholder="Enter 6-digit reset code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                icon={<FaKey />}
                required
              />
            </div>
            <div className="mb-3">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<FaLock />}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={forgotLoading}
              loadingText="Updating Password..."
            >
              Reset Password
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Login;