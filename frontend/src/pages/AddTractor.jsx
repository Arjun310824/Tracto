import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaTractor, FaMapMarkerAlt, FaCogs, FaRupeeSign, FaExclamationTriangle, FaArrowLeft, FaCheckCircle, FaUpload } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

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
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
            <div
              className="p-3 rounded-circle d-inline-flex mb-2 shadow-sm"
              style={{ background: "var(--primary-50)", color: "var(--primary-600)" }}
            >
              <FaTractor className="fs-3" />
            </div>
            <h1 className="h3 fw-extrabold text-dark m-0 font-heading">List a New Tractor</h1>
            <p className="text-muted small mt-1">Publish equipment specifications, daily rates, and location</p>
          </div>

          {error && (
            <div className="alert alert-danger p-3 rounded-3 mb-4 small d-flex align-items-center gap-2">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Primary Details */}
            <h5 className="fw-bold text-dark mb-3 font-heading d-flex align-items-center gap-2">
              <FaTractor className="text-success" /> Machinery Details
            </h5>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-8">
                <Input
                  label="Tractor Name / Model Title *"
                  placeholder="e.g. Mahindra 575 DI Power Plus"
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

            {/* Pricing Section */}
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

            {/* Location Section */}
            <h5 className="fw-bold text-dark mt-4 mb-3 font-heading d-flex align-items-center gap-2">
              <FaMapMarkerAlt className="text-danger" /> Yard & Field Location
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
                  placeholder="e.g. Ahmedabad, Rajkot"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <Input
                  label="City / Village / Taluka *"
                  placeholder="e.g. Sanand, Dholka"
                  value={formData.city_village}
                  onChange={(e) => setFormData({ ...formData, city_village: e.target.value })}
                  required
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

            {/* Tractor Main Image */}
            <div className="mb-4">
              <label className="tracto-label mb-2">Primary Equipment Photo</label>
              <div className="p-3 bg-light rounded-3 border text-center">
                {imagePreview ? (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-3 mx-auto"
                      style={{ maxHeight: 200, objectFit: "cover" }}
                    />
                  </div>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="tracto-input p-2 rounded-3 border bg-white"
                  style={{ width: "100%", maxWidth: 360 }}
                />
                <small className="text-muted d-block mt-2">
                  Upload a clear, daylight photograph of your tractor.
                </small>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="tracto-label">Description & Farm Capabilities</label>
              <textarea
                className="tracto-input p-3 rounded-3 border"
                rows="3"
                placeholder="Mention recent maintenance, tyre condition, and suitability for plowing or hauling..."
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
                isLoading={loading}
                loadingText="Publishing Listing..."
                icon={<FaCheckCircle />}
              >
                Publish Tractor Listing
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddTractor;