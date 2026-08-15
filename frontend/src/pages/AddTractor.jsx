import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTractor, FaMapMarkerAlt, FaCogs, FaRupeeSign, FaExclamationTriangle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function AddTractor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    location: "Ahmedabad",
    state: "Gujarat",
    district: "Ahmedabad",
    city_village: "",
    pincode: "",
    description: "",
    available: true,
  });

  const [mainImage, setMainImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (mainImage) {
        data.append("image", mainImage);
      }

      await api.post("tractors/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/my-tractors");
    } catch (err) {
      console.error("Error adding tractor:", err);
      setError("Failed to create tractor listing. Please check required fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4" style={{ maxWidth: 880 }}>
        <h2 className="fw-extrabold text-dark mb-4">Add New Tractor Listing</h2>

        {error && <div className="alert alert-danger small p-3 rounded-3 mb-4 d-flex align-items-center gap-2"><FaExclamationTriangle /> {error}</div>}

        <div className="card glass-card border-0 p-4">
          <form onSubmit={handleSubmit}>
            {/* Primary Details */}
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaTractor className="text-success" /> Basic Information
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Tractor Name / Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mahindra 575 DI Power Plus"
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
                  placeholder="e.g. 575 DI 4WD"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Primary Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setMainImage(e.target.files[0])}
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaCogs className="text-primary" /> Technical Specifications
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Horsepower (HP) *</label>
                <input
                  type="number"
                  className="form-control"
                  min="15"
                  max="120"
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
                  min="2000"
                  max="2026"
                  value={formData.manufacturing_year}
                  onChange={(e) => setFormData({ ...formData, manufacturing_year: parseInt(e.target.value) || 2023 })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Fuel Type</label>
                <select className="form-select" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}>
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Transmission</label>
                <select className="form-select" value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="hydrostatic">Hydrostatic</option>
                </select>
              </div>
            </div>

            {/* Rental Rates */}
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaRupeeSign className="text-warning" /> Pricing Rates (₹)
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Rent Per Day (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  min="100"
                  value={formData.rent_per_day}
                  onChange={(e) => setFormData({ ...formData, rent_per_day: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Rent Per Hour (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  min="50"
                  value={formData.rent_per_hour}
                  onChange={(e) => setFormData({ ...formData, rent_per_hour: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            {/* Location Details */}
            <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <FaMapMarkerAlt className="text-danger" /> Location & Availability
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Full Address / Landmark *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Near Bus Stand, Sanand"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">District *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ahmedabad"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Village / City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sanand"
                  value={formData.city_village}
                  onChange={(e) => setFormData({ ...formData, city_village: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold small text-muted">Pincode</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 382110"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-muted">Description & Attachments Info</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe rotavator attachment, trailer capability, or condition..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>


            <div className="d-flex justify-content-end gap-3">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate("/my-tractors")}>
                Cancel
              </button>
              <button type="submit" className="btn btn-tracto-primary rounded-pill px-5 fw-bold" disabled={loading}>
                {loading ? "Saving Tractor..." : "Publish Tractor Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTractor;