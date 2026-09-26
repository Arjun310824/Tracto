import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaImages,
  FaCogs,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaMapMarkerAlt,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";

function MyTractors() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  // Add Equipment Modal State
  const [selectedTractorForImplement, setSelectedTractorForImplement] = useState(null);
  const [implementFormData, setImplementFormData] = useState({
    name: "",
    category: "rotavator",
    rent_per_day: 800,
    rent_per_hour: 150,
    description: "",
  });
  const [savingImplement, setSavingImplement] = useState(false);

  // Gallery Upload Modal State
  const [galleryModalTractor, setGalleryModalTractor] = useState(null);

  useEffect(() => {
    fetchMyTractors();
  }, []);

  const fetchMyTractors = async () => {
    setLoading(true);
    try {
      const res = await api.get("tractors/");
      const data = res.data.results || res.data || [];
      const filtered = data.filter((t) => t.owner === user?.id || t.owner_details?.id === user?.id);
      setTractors(filtered);
    } catch (err) {
      console.error("Error fetching my tractors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailable = async (tractor) => {
    try {
      const res = await api.patch(`tractors/${tractor.id}/`, {
        available: !tractor.available,
      });
      setTractors(tractors.map((t) => (t.id === tractor.id ? { ...t, available: res.data.available } : t)));
    } catch (err) {
      console.error("Error toggling availability:", err);
    }
  };

  const handleDeleteTractor = async (tractorId) => {
    if (!window.confirm("Are you sure you want to delete this tractor listing?")) return;

    try {
      await api.delete(`tractors/${tractorId}/`);
      setTractors(tractors.filter((t) => t.id !== tractorId));
    } catch (err) {
      console.error("Error deleting tractor:", err);
    }
  };

  const handleUploadGalleryImages = async (tractorId) => {
    const files = selectedFiles[tractorId];
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    setUploadingId(tractorId);
    try {
      await api.post(`tractors/${tractorId}/upload_images/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Gallery images uploaded successfully!");
      setGalleryModalTractor(null);
      fetchMyTractors();
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Failed to upload gallery images.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddImplementSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTractorForImplement) return;

    setSavingImplement(true);
    try {
      await api.post("implements/", {
        tractor: selectedTractorForImplement.id,
        ...implementFormData,
      });
      alert("Equipment implement attachment added successfully!");
      setSelectedTractorForImplement(null);
      fetchMyTractors();
    } catch (err) {
      console.error("Error adding implement:", err);
      alert("Failed to add implement attachment.");
    } finally {
      setSavingImplement(false);
    }
  };

  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
  const defaultImg = `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;

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
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading">My Machinery Fleet</h1>
                <p className="text-muted small m-0 mt-0.5">Manage tractor listings, set rental rates, and manage implements</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/add-tractor")}
                icon={<FaPlusCircle />}
              >
                Add New Tractor
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
                <p className="text-muted small mt-3">Loading your fleet...</p>
              </div>
            ) : tractors.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 shadow-sm my-2">
                <EmptyState
                  icon={<FaTractor />}
                  title="No Tractors Listed Yet"
                  description="You haven't listed any equipment. Add your first tractor to start receiving rental requests from farmers."
                  action={
                    <Button variant="primary" size="sm" onClick={() => navigate("/add-tractor")} icon={<FaPlusCircle />}>
                      List Your First Tractor
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="row g-3 g-md-4">
                {tractors.map((t) => (
                  <div key={t.id} className="col-12 col-md-6 col-xl-4">
                    <div className="bg-white rounded-4 border overflow-hidden shadow-sm h-100 d-flex flex-column">
                      <div className="position-relative">
                        <img
                          src={
                            t.image
                              ? t.image.startsWith("http")
                                ? t.image
                                : `${BACKEND_BASE}${t.image}`
                              : defaultImg
                          }
                          alt={t.name}
                          className="w-100"
                          style={{ height: 200, objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = defaultImg;
                          }}
                        />
                        <div className="position-absolute top-3 end-3">
                          <button
                            type="button"
                            className={`badge border-0 rounded-pill px-3 py-1.5 fw-bold cursor-pointer shadow-sm ${
                              t.available ? "bg-success text-white" : "bg-danger text-white"
                            }`}
                            onClick={() => handleToggleAvailable(t)}
                            title="Click to toggle availability"
                          >
                            {t.available ? "● Available" : "○ Offline"}
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Badge variant="primary" size="sm">{t.brand}</Badge>
                          <span className="small text-muted">{t.horsepower} HP • {t.fuel_type || "Diesel"}</span>
                        </div>

                        <h5 className="fw-bold text-dark font-heading mb-1 text-truncate" title={t.name}>
                          {t.name}
                        </h5>

                        <p className="text-muted small mb-3 d-flex align-items-center gap-1 text-truncate">
                          <FaMapMarkerAlt className="text-danger flex-shrink-0" />
                          <span>{t.location}</span>
                        </p>

                        <div className="p-2.5 bg-light rounded-3 border mb-3 small d-flex justify-content-between">
                          <div>
                            <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Daily Rate</span>
                            <span className="fw-bold text-success font-monospace font-heading">₹{t.rent_per_day}</span>
                          </div>
                          <div className="text-end">
                            <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Hourly Rate</span>
                            <span className="fw-bold text-dark font-monospace">₹{t.rent_per_hour}/hr</span>
                          </div>
                        </div>

                        {/* Implements Tag Strip */}
                        {t.attached_implements && t.attached_implements.length > 0 && (
                          <div className="mb-3">
                            <span className="text-muted small d-block mb-1">Attached Implements:</span>
                            <div className="d-flex flex-wrap gap-1">
                              {t.attached_implements.map((impl) => (
                                <Badge key={impl.id} variant="neutral" size="sm">
                                  {impl.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-auto pt-3 border-top d-flex flex-wrap gap-1.5 justify-content-between">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/edit-tractor/${t.id}`)}
                            icon={<FaEdit />}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTractorForImplement(t)}
                            icon={<FaCogs />}
                          >
                            + Implement
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGalleryModalTractor(t)}
                            icon={<FaImages />}
                          >
                            Photos
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTractor(t.id)}
                            icon={<FaTrash className="text-danger" />}
                            title="Delete Tractor"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Implement Attachment Modal */}
      <Modal
        isOpen={Boolean(selectedTractorForImplement)}
        onClose={() => setSelectedTractorForImplement(null)}
        title={`Add Implement to ${selectedTractorForImplement?.name || "Tractor"}`}
        size="md"
      >
        <form onSubmit={handleAddImplementSubmit}>
          <Input
            label="Implement Name *"
            placeholder="e.g. 7-Tyne Heavy Cultivator, 6ft Rotavator"
            value={implementFormData.name}
            onChange={(e) => setImplementFormData({ ...implementFormData, name: e.target.value })}
            required
          />

          <div className="mb-3">
            <label className="tracto-label">Equipment Category *</label>
            <div className="tracto-input-wrapper">
              <select
                className="tracto-input"
                value={implementFormData.category}
                onChange={(e) => setImplementFormData({ ...implementFormData, category: e.target.value })}
              >
                <option value="rotavator">Rotavator (રોટાવેટર)</option>
                <option value="cultivator">Cultivator / Plough (ખેડવા માટે)</option>
                <option value="seeder">Seed Drill / Sower (વાવણી)</option>
                <option value="trailer">Trailer / Trolley (ટ્રોલી)</option>
                <option value="harvester">Thresher / Harvester (થ્રેશર)</option>
                <option value="leveler">Land Leveler (સમતલ)</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <Input
                label="Daily Addon (₹)"
                type="number"
                value={implementFormData.rent_per_day}
                onChange={(e) =>
                  setImplementFormData({ ...implementFormData, rent_per_day: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="col-6">
              <Input
                label="Hourly Addon (₹)"
                type="number"
                value={implementFormData.rent_per_hour}
                onChange={(e) =>
                  setImplementFormData({ ...implementFormData, rent_per_hour: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="Blade count, brand, or matching operation..."
            value={implementFormData.description}
            onChange={(e) => setImplementFormData({ ...implementFormData, description: e.target.value })}
          />

          <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
            <Button variant="ghost" onClick={() => setSelectedTractorForImplement(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={savingImplement}
              loadingText="Saving..."
            >
              Add Attachment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Gallery Upload Photos Modal */}
      <Modal
        isOpen={Boolean(galleryModalTractor)}
        onClose={() => setGalleryModalTractor(null)}
        title={`Gallery Photos: ${galleryModalTractor?.name}`}
        size="md"
      >
        <div>
          <p className="text-muted small mb-3">
            Select high quality photos of this tractor from different angles to showcase to prospective renters.
          </p>
          <div className="mb-3">
            <input
              type="file"
              multiple
              accept="image/*"
              className="tracto-input p-2 rounded-3 border"
              style={{ width: "100%" }}
              onChange={(e) =>
                setSelectedFiles({ ...selectedFiles, [galleryModalTractor?.id]: e.target.files })
              }
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button variant="ghost" onClick={() => setGalleryModalTractor(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={uploadingId === galleryModalTractor?.id}
              loadingText="Uploading Photos..."
              onClick={() => handleUploadGalleryImages(galleryModalTractor?.id)}
            >
              Upload Gallery
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MyTractors;