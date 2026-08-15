import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTractor, FaMapMarkerAlt, FaCogs, FaRupeeSign, FaExclamationTriangle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function EditTractor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    brand: "Mahindra",
    model: "",
    horsepower: 45,
    manufacturing_year: 2023,
    fuel_type: "diesel",
    transmission: "manual",
    rent_per_hour: 300,
    rent_per_day: 2500,
    location: "",
    state: "Gujarat",
    district: "",
    city_village: "",
    pincode: "",
    description: "",
    available: true,
  });

  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    fetchTractorDetails();
  }, [id]);

  const fetchTractorDetails = async () => {
    try {
      const res = await api.get(`tractors/${id}/`);
      const t = res.data;
      setFormData({
        name: t.name || "",
        brand: t.brand || "Mahindra",
        model: t.model || "",
        horsepower: t.horsepower || 45,
        manufacturing_year: t.manufacturing_year || 2023,
        fuel_type: t.fuel_type || "diesel",
        transmission: t.transmission || "manual",
        rent_per_hour: t.rent_per_hour || 300,
        rent_per_day: t.rent_per_day || 2500,
        location: t.location || "",
        state: t.state || "Gujarat",
        district: t.district || "",
        city_village: t.city_village || "",
        pincode: t.pincode || "",
        description: t.description || "",
        available: t.available ?? true,
      });
    } catch (err) {
      console.error("Error loading tractor details:", err);
      setError("Tractor not found or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (mainImage) {
        data.append("image", mainImage);
      }

      await api.patch(`tractors/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/my-tractors");
    } catch (err) {
      console.error("Error updating tractor:", err);
      setError("Failed to update tractor. Please check inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4" style={{ maxWidth: 880 }}>
        <h2 className="fw-extrabold text-dark mb-4">Edit Tractor Listing</h2>

        {error && <div className="alert alert-danger small p-3 rounded-3 mb-4 d-flex align-items-center gap-2"><FaExclamationTriangle /> {error}</div>}

        <div className="card glass-card border-0 p-4">
          <form onSubmit={handleSubmit}>
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaTractor className="text-success" /> Basic Information
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Tractor Name / Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Brand *</label>
                <select className="form-select" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}>
                  <option value="Mahindra">Mahindra</option>
                  <option value="Swaraj">Swaraj</option>
                  <option value="John Deere">John Deere</option>
                  <option value="Sonalika">Sonalika</option>
                  <option value="Farmtrac">Farmtrac</option>
                  <option value="Eicher">Eicher</option>
                  <option value="New Holland">New Holland</option>
                  <option value="Kubota">Kubota</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Model Code / Specification *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Replace Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setMainImage(e.target.files[0])}
                />
              </div>
            </div>

            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaCogs className="text-primary" /> Technical Specifications
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Horsepower (HP) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.horsepower}
                  onChange={(e) => setFormData({ ...formData, horsepower: parseInt(e.target.value) || 45 })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Manufacturing Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.manufacturing_year}
                  onChange={(e) => setFormData({ ...formData, manufacturing_year: parseInt(e.target.value) || 2023 })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Rent Per Day (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.rent_per_day}
                  onChange={(e) => setFormData({ ...formData, rent_per_day: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Rent Per Hour (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.rent_per_hour}
                  onChange={(e) => setFormData({ ...formData, rent_per_hour: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            {/* Location & Description */}
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaMapMarkerAlt className="text-danger" /> Location & Details
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Full Address / Location *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">District</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Village / City</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.city_village}
                  onChange={(e) => setFormData({ ...formData, city_village: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-muted">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>


            <div className="d-flex justify-content-end gap-3">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate("/my-tractors")}>
                Cancel
              </button>
              <button type="submit" className="btn btn-tracto-primary rounded-pill px-5 fw-bold" disabled={saving}>
                {saving ? "Saving Changes..." : "Update Tractor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTractor;