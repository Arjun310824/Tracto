import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

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
  const [imagePreview, setImagePreview] = useState(null);

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

      if (t.image) {
        const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
        setImagePreview(t.image.startsWith("http") ? t.image : `${BACKEND_BASE}${t.image}`);
      }
    } catch (err) {
      console.error("Error loading tractor details:", err);
      setError("Tractor not found or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setImagePreview(URL.createObjectURL(file));
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
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
        <Navbar />
        <div className="text-center py-5 my-auto">
          <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
          <p className="text-muted small mt-3">Loading tractor details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <main className="container py-4 flex-grow-1" style={{ maxWidth: 860 }}>
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/my-tractors")}
            icon={<FaArrowLeft />}
          >
            Back to My Fleet
          </Button>
        </div>

        <div className="bg-white rounded-4 border p-4 p-md-5 shadow-sm">
          <div className="text-center mb-4 pb-3 border-bottom">
            <h1 className="h3 fw-extrabold text-dark m-0 font-heading">Edit Tractor Listing</h1>
            <p className="text-muted small mt-1">Update rates, specifications, and machine availability</p>
          </div>

          {error && (
            <div className="alert alert-danger p-3 rounded-3 mb-4 small d-flex align-items-center gap-2">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h5 className="fw-bold text-dark mb-3 font-heading d-flex align-items-center gap-2">
              <FaTractor className="text-success" /> Machinery Details
            </h5>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-8">
                <Input
                  label="Tractor Name / Title *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="tracto-label">Brand *</label>
                <div className="tracto-input-wrapper">
                  <select
                    className="tracto-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  >
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
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6 col-md-3">
                <Input
                  label="Horsepower (HP) *"
                  type="number"
                  value={formData.horsepower}
                  onChange={(e) => setFormData({ ...formData, horsepower: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="col-6 col-md-3">
                <Input
                  label="Mfg Year *"
                  type="number"
                  value={formData.manufacturing_year}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturing_year: parseInt(e.target.value) || 2023 })
                  }
                  required
                />
              </div>

              <div className="col-6 col-md-3">
                <label className="tracto-label">Fuel Type</label>
                <div className="tracto-input-wrapper">
                  <select
                    className="tracto-input"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                  >
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="petrol">Petrol</option>
                  </select>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <label className="tracto-label">Transmission</label>
                <div className="tracto-input-wrapper">
                  <select
                    className="tracto-input"
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="power_steering">Power Steering</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <h5 className="fw-bold text-dark mt-4 mb-3 font-heading d-flex align-items-center gap-2">
              <FaRupeeSign className="text-success" /> Rental Pricing
            </h5>

            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6">
                <Input
                  label="Rent per Day (₹) *"
                  type="number"
                  value={formData.rent_per_day}
                  onChange={(e) => setFormData({ ...formData, rent_per_day: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <Input
                  label="Rent per Hour (₹) *"
                  type="number"
                  value={formData.rent_per_hour}
                  onChange={(e) => setFormData({ ...formData, rent_per_hour: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <h5 className="fw-bold text-dark mt-4 mb-3 font-heading d-flex align-items-center gap-2">
              <FaMapMarkerAlt className="text-danger" /> Location
            </h5>

            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6">
                <Input
                  label="State *"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <Input
                  label="District *"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <Input
                  label="City / Village *"
                  value={formData.city_village}
                  onChange={(e) => setFormData({ ...formData, city_village: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <Input
                  label="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* Image Preview & Upload */}
            <div className="mb-4">
              <label className="tracto-label mb-2">Primary Equipment Photo</label>
              <div className="p-3 bg-light rounded-3 border text-center">
                {imagePreview && (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Current"
                      className="rounded-3 mx-auto"
                      style={{ maxHeight: 200, objectFit: "cover" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="tracto-input p-2 rounded-3 border bg-white"
                  style={{ width: "100%", maxWidth: 360 }}
                />
                <small className="text-muted d-block mt-2">
                  Select a new photo if you want to replace the current image.
                </small>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="tracto-label">Description</label>
              <textarea
                className="tracto-input p-3 rounded-3 border"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: "100%", outline: "none", borderColor: "var(--border-subtle)" }}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Button variant="ghost" onClick={() => navigate("/my-tractors")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={saving}
                loadingText="Saving Changes..."
                icon={<FaCheckCircle />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditTractor;