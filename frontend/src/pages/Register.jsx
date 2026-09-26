import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaTractor,
  FaCheckCircle,
  FaExclamationCircle,
  FaSeedling,
} from "react-icons/fa";
import { registerUser } from "../services/authService";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "customer",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await registerUser(formData);
      setMessage("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);
      setIsError(true);
      setMessage(
        error.response?.data?.email?.[0] ||
          error.response?.data?.detail ||
          "Registration failed. Please check inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <main className="container my-auto py-4 py-md-5 d-flex justify-content-center align-items-center px-3">
        <div
          className="card border-0 p-4 p-md-5 shadow-lg w-100 rounded-4"
          style={{
            maxWidth: 580,
            background: "#ffffff",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="p-3 rounded-circle d-inline-flex mb-2 shadow-sm"
              style={{ background: "var(--primary-50)", color: "var(--primary-600)" }}
            >
              <FaTractor className="fs-3" />
            </div>
            <h2 className="fw-extrabold text-dark m-0">Create TRACTO Account</h2>
            <p className="text-muted small mt-1">
              Join India's leading agricultural equipment sharing network
            </p>
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
            {/* First & Last Name */}
            <div className="row g-2 mb-1">
              <div className="col-12 col-sm-6">
                <Input
                  label="First Name"
                  name="first_name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  icon={<FaUser />}
                  required
                />
              </div>
              <div className="col-12 col-sm-6">
                <Input
                  label="Last Name"
                  name="last_name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  icon={<FaUser />}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<FaEnvelope />}
              required
            />

            {/* Mobile Phone Number */}
            <Input
              label="Mobile Phone Number"
              type="tel"
              name="phone"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              icon={<FaPhone />}
            />

            {/* Role Selection Cards */}
            <div className="mb-3">
              <label className="tracto-label mb-2">Select Your Role <span className="tracto-required">*</span></label>
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div
                    onClick={() => setFormData({ ...formData, role: "customer" })}
                    className={`p-3 rounded-3 border d-flex flex-column gap-1 cursor-pointer transition-all ${
                      formData.role === "customer"
                        ? "border-success bg-success-subtle text-success shadow-sm"
                        : "border-light-subtle bg-light text-secondary"
                    }`}
                    style={{ cursor: "pointer", borderWidth: 2 }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold fs-6 d-flex align-items-center gap-1.5">
                        <FaSeedling /> Farmer / Renter
                      </span>
                      {formData.role === "customer" && <FaCheckCircle className="text-success" />}
                    </div>
                    <small className="opacity-75" style={{ fontSize: "0.8rem" }}>
                      Rent machinery, book slots & implements for your crops
                    </small>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    onClick={() => setFormData({ ...formData, role: "owner" })}
                    className={`p-3 rounded-3 border d-flex flex-column gap-1 cursor-pointer transition-all ${
                      formData.role === "owner"
                        ? "border-success bg-success-subtle text-success shadow-sm"
                        : "border-light-subtle bg-light text-secondary"
                    }`}
                    style={{ cursor: "pointer", borderWidth: 2 }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold fs-6 d-flex align-items-center gap-1.5">
                        <FaTractor /> Equipment Owner
                      </span>
                      {formData.role === "owner" && <FaCheckCircle className="text-success" />}
                    </div>
                    <small className="opacity-75" style={{ fontSize: "0.8rem" }}>
                      List tractors & harvesters, approve bookings & earn
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create strong password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              icon={<FaLock />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              loadingText="Creating Account..."
              icon={<FaCheckCircle />}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center mt-4 pt-3 border-top small text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-success fw-bold text-decoration-none">
              Sign In Here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;