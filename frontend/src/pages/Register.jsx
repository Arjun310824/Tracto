import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaTractor, FaUserTag } from "react-icons/fa";
import { registerUser } from "../services/authService";
import Navbar from "../components/Navbar";

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await registerUser(formData);
      setMessage("Registration Successful! Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);
      setIsError(true);
      setMessage(error.response?.data?.email?.[0] || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-5 d-flex justify-content-center align-items-center">
        <div className="card glass-card border-0 p-4 p-md-5 shadow-lg w-100" style={{ maxWidth: 520 }}>
          <div className="text-center mb-4">
            <div className="bg-success text-white p-3 rounded-circle d-inline-flex mb-2">
              <FaTractor className="fs-3" />
            </div>
            <h3 className="fw-extrabold text-dark m-0">Create TRACTO Account</h3>
            <p className="text-muted small">Join as a Customer to rent or Owner to list tractors</p>
          </div>

          {message && (
            <div className={`alert ${isError ? "alert-danger" : "alert-success"} p-2.5 small text-center mb-4`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold small text-muted">First Name *</label>
                <input
                  className="form-control"
                  placeholder="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-6">
                <label className="form-label fw-semibold small text-muted">Last Name *</label>
                <input
                  className="form-control"
                  placeholder="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">Email Address *</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <FaEnvelope />
                </span>
                <input
                  className="form-control border-start-0 ps-0"
                  placeholder="name@example.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">Mobile Phone Number</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <FaPhone />
                </span>
                <input
                  className="form-control border-start-0 ps-0"
                  placeholder="10-digit phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">Account Role *</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <FaUserTag />
                </span>
                <select
                  className="form-select border-start-0 ps-0"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">👨🌾 Customer (Rent Tractors)</option>
                  <option value="owner">🚜 Owner (List & Rent Out Tractors)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small text-muted">Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <FaLock />
                </span>
                <input
                  className="form-control border-start-0 ps-0"
                  placeholder="Create a strong password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="btn btn-tracto-primary w-100 py-2.5 rounded-pill fw-bold" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top small text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-success fw-bold text-decoration-none">
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;