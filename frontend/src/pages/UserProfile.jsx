import { useState, useEffect } from "react";
import { FaUser, FaLock, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, FaCamera } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

function UserProfile() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

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
      setPassErr(
        err.response?.data?.error || "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Responsive Sidebar for Mobile & Desktop */}
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            <div className="mb-4">
              <h1 className="h3 fw-extrabold text-dark m-0 font-heading">User Profile & Settings</h1>
              <p className="text-muted small m-0 mt-0.5">Manage your personal information, address, and login credentials</p>
            </div>

            <div className="row g-4">
              {/* Left Column: Personal Information & Address Form */}
              <div className="col-12 col-lg-7">
                <div className="bg-white rounded-4 border p-4 shadow-sm">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading">Personal & Farm Details</h5>
                    <Badge variant={user?.role === "owner" ? "warning" : user?.role === "admin" ? "danger" : "success"}>
                      {user?.role || "Customer"} Account
                    </Badge>
                  </div>

                  {profileMsg && (
                    <div className="alert alert-success p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FaCheckCircle /> <span>{profileMsg}</span>
                    </div>
                  )}
                  {profileErr && (
                    <div className="alert alert-danger p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FaExclamationTriangle /> <span>{profileErr}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit}>
                    <div className="row g-2 mb-1">
                      <div className="col-12 col-sm-6">
                        <Input
                          label="First Name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Last Name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-1">
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Email Address"
                          value={user?.email || ""}
                          disabled
                          helperText="Contact admin to modify registered email"
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Mobile Phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark mt-3 mb-2 font-heading d-flex align-items-center gap-1.5">
                      <FaMapMarkerAlt className="text-danger" /> Farm Address Location
                    </h6>

                    <div className="row g-2 mb-3">
                      <div className="col-12 col-sm-6">
                        <Input
                          label="State"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="District"
                          placeholder="e.g. Ahmedabad, Rajkot"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Village / Taluka"
                          placeholder="e.g. Sanand, Dholka"
                          value={formData.village}
                          onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="PIN Code"
                          placeholder="e.g. 382110"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={loading}
                      loadingText="Saving Profile..."
                    >
                      Save Profile Changes
                    </Button>
                  </form>
                </div>
              </div>

              {/* Right Column: Security & Password */}
              <div className="col-12 col-lg-5">
                <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
                  <h5 className="fw-extrabold text-dark mb-3 pb-2 border-bottom font-heading d-flex align-items-center gap-2">
                    <FaLock className="text-warning" /> Security & Password
                  </h5>

                  {passMsg && (
                    <div className="alert alert-success p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FaCheckCircle /> <span>{passMsg}</span>
                    </div>
                  )}
                  {passErr && (
                    <div className="alert alert-danger p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FaExclamationTriangle /> <span>{passErr}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit}>
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter current password"
                      value={passData.old_password}
                      onChange={(e) => setPassData({ ...passData, old_password: e.target.value })}
                      required
                    />

                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new strong password"
                      value={passData.new_password}
                      onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                      required
                    />

                    <Button
                      type="submit"
                      variant="secondary"
                      fullWidth
                      isLoading={loading}
                      loadingText="Updating Password..."
                    >
                      Update Password
                    </Button>
                  </form>
                </div>

                <div className="bg-light p-3.5 rounded-4 border">
                  <h6 className="fw-bold text-dark font-heading">Account Status</h6>
                  <p className="text-muted small mb-2">
                    Your account is registered as an authorized {user?.role || "customer"}.
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <Badge variant="success" size="sm" dot>Active & Verified</Badge>
                  </div>
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
