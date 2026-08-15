import { useState, useEffect } from "react";
import { FaUser, FaLock, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    state: "Gujarat",
    district: "",
    village: "",
    pincode: "",
  });

  const [passData, setPassData] = useState({
    old_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      const u = res.data;
      setFormData({
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        phone: u.phone || "",
        state: u.state || "Gujarat",
        district: u.district || "",
        village: u.village || "",
        pincode: u.pincode || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg("");
    setProfileErr("");

    try {
      const res = await api.put("accounts/profile/", formData);
      localStorage.setItem("user", JSON.stringify(res.data));
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileErr("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPassMsg("");
    setPassErr("");

    try {
      await api.post("accounts/change-password/", passData);
      setPassMsg("Password changed successfully!");
      setPassData({ old_password: "", new_password: "" });
    } catch (err) {
      console.error("Password change error:", err);
      setPassErr(err.response?.data?.error || "Failed to change password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);

    const formDataImg = new FormData();
    formDataImg.append("profile_image", file);

    try {
      const res = await api.put("accounts/profile/", formDataImg, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      setProfileMsg("Profile photo updated successfully!");
    } catch (err) {
      console.error("Avatar update error:", err);
      setProfileErr("Failed to update profile photo.");
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-xl-10 p-4" style={{ maxWidth: 1000 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-extrabold text-dark m-0">Account Profile & Settings</h2>
                <p className="text-muted small mb-0">Manage your profile, password, and location</p>
              </div>
              <span className={`badge rounded-pill text-uppercase fs-6 px-3 py-2 ${user?.role === "owner" ? "bg-warning text-dark" : user?.role === "admin" ? "bg-danger" : "bg-success"}`}>
                {user?.role === "customer" ? "👨🌾 Customer" : user?.role === "owner" ? "🚜 Owner" : "👨💼 Admin"}
              </span>
            </div>

            <div className="row g-4">
              {/* Profile Details Form */}
              <div className="col-md-7">
                <div className="card glass-card border-0 p-4 mb-4">
                  <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                    <FaUser className="text-success" /> Profile Photo & Details
                  </h5>

                  {profileMsg && <div className="alert alert-success p-2 small">{profileMsg}</div>}
                  {profileErr && <div className="alert alert-danger p-2 small">{profileErr}</div>}

                  {/* Avatar Upload */}
                  <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3 border">
                    <div className="position-relative">
                      {user?.profile_image ? (
                        <img
                          src={user.profile_image.startsWith("http") ? user.profile_image : `http://127.0.0.1:8000${user.profile_image}`}
                          alt="Avatar"
                          className="rounded-circle border border-success border-2"
                          style={{ width: 70, height: 70, objectFit: "cover" }}
                        />
                      ) : (
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3" style={{ width: 70, height: 70 }}>
                          {(user?.first_name || user?.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="btn btn-outline-success btn-sm rounded-pill cursor-pointer mb-1">
                        Upload New Photo
                        <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                      </label>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>JPG, PNG or WEBP (Max 2MB)</div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit}>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-muted">Email Address (Read-Only)</label>
                      <input type="email" className="form-control bg-light" value={user?.email || ""} disabled />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-muted">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <h6 className="fw-bold text-dark mt-4 mb-3 d-flex align-items-center gap-1">
                      <FaMapMarkerAlt className="text-danger" /> Location Details
                    </h6>

                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">State</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">District</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Ahmedabad"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">Village / City</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Sanand"
                          value={formData.village}
                          onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">Pincode</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="382110"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-tracto-primary rounded-pill px-4" disabled={loading}>
                      Save Profile Changes
                    </button>
                  </form>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="col-md-5">
                <div className="card glass-card border-0 p-4">
                  <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                    <FaLock className="text-warning" /> Change Password
                  </h5>

                  {passMsg && <div className="alert alert-success p-2 small">{passMsg}</div>}
                  {passErr && <div className="alert alert-danger p-2 small">{passErr}</div>}

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-muted">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passData.old_password}
                        onChange={(e) => setPassData({ ...passData, old_password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold small text-muted">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passData.new_password}
                        onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-warning text-dark rounded-pill px-4 fw-bold" disabled={loading}>
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
