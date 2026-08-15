import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTractor, FaPlusCircle, FaEdit, FaTrash, FaImages, FaCogs, FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MyTractors() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

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
      alert("Equipment attachment added successfully!");
      setSelectedTractorForImplement(null);
      setImplementFormData({
        name: "",
        category: "rotavator",
        rent_per_day: 800,
        rent_per_hour: 150,
        description: "",
      });
      fetchMyTractors();
    } catch (err) {
      console.error("Error adding implement:", err);
      alert("Failed to add equipment attachment.");
    } finally {
      setSavingImplement(false);
    }
  };

  const handleDeleteImplement = async (implementId) => {
    if (!window.confirm("Are you sure you want to remove this equipment attachment?")) return;
    try {
      await api.delete(`implements/${implementId}/`);
      fetchMyTractors();
    } catch (err) {
      console.error("Error deleting implement:", err);
    }
  };

  const defaultImg = "http://127.0.0.1:8000/media/tractors/mahindra_gen.png";

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-xl-10 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-extrabold text-dark m-0">My Tractors & Attachments</h2>
                <p className="text-muted small">Manage tractor listings, multi-photo galleries, and agricultural attachments</p>
              </div>
              <Link to="/add-tractor" className="btn btn-tracto-primary rounded-pill px-4 btn-sm d-flex align-items-center gap-1.5">
                <FaPlusCircle /> Add Tractor
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : tractors.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaTractor className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Tractors Listed</h5>
                <p className="text-muted small">Start earning by listing your farming tractors.</p>
                <Link to="/add-tractor" className="btn btn-success rounded-pill px-4 btn-sm">
                  Add Your First Tractor
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {tractors.map((tractor) => {
                  const img = tractor.image ? (tractor.image.startsWith("http") ? tractor.image : `http://127.0.0.1:8000${tractor.image}`) : defaultImg;
                  const implementsList = tractor.attached_implements || [];

                  return (
                    <div key={tractor.id} className="col-md-6 col-xl-4">
                      <div className="card glass-card h-100 border-0 overflow-hidden">
                        <img src={img} className="tractor-card-img" alt={tractor.name} onError={(e) => { e.target.src = defaultImg; }} />

                        <div className="card-body p-3.5 d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-success-subtle text-success fw-bold">{tractor.brand}</span>
                            <button
                              className={`btn btn-sm rounded-pill py-0.5 px-2.5 small fw-bold ${tractor.available ? "btn-success" : "btn-secondary"}`}
                              onClick={() => handleToggleAvailable(tractor)}
                              title="Click to toggle availability"
                            >
                              {tractor.available ? "Available" : "Unavailable"}
                            </button>
                          </div>

                          <h5 className="fw-bold text-dark mb-1">{tractor.name}</h5>
                          <div className="text-muted small mb-3">{tractor.horsepower} HP • ₹{tractor.rent_per_day}/day (₹{tractor.rent_per_hour}/hr)</div>

                          {/* Attached Equipment Section */}
                          <div className="bg-success-subtle p-2.5 rounded-3 mb-3 border border-success-subtle">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="small text-dark fw-bold d-flex align-items-center gap-1">
                                <FaCogs className="text-success" /> Equipment Attachments ({implementsList.length})
                              </span>
                              <button
                                className="btn btn-success btn-sm rounded-pill py-0.5 px-2.5 text-white fw-bold"
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => setSelectedTractorForImplement(tractor)}
                              >
                                + Add Attachment
                              </button>
                            </div>

                            {implementsList.length === 0 ? (
                              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                No attachments added for this tractor yet.
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-1.5">
                                {implementsList.map((impl) => (
                                  <div key={impl.id} className="bg-white p-2 rounded border d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-bold text-dark" style={{ fontSize: "0.8rem" }}>{impl.name}</div>
                                      <div className="text-success fw-bold" style={{ fontSize: "0.75rem" }}>
                                        ₹{impl.rent_per_day}/day (₹{impl.rent_per_hour}/hr)
                                      </div>
                                    </div>
                                    <button
                                      className="btn btn-link text-danger p-0 border-0"
                                      onClick={() => handleDeleteImplement(impl.id)}
                                      title="Remove attachment"
                                    >
                                      <FaTrash style={{ fontSize: "0.8rem" }} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Gallery Images Upload Section */}
                          <div className="bg-light p-2.5 rounded-3 mb-3 border">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small text-muted fw-bold d-flex align-items-center gap-1">
                                <FaImages className="text-primary" /> Multi-Images Gallery ({tractor.additional_images?.length || 0})
                              </span>
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="form-control form-control-sm mb-2"
                              onChange={(e) => setSelectedFiles({ ...selectedFiles, [tractor.id]: e.target.files })}
                            />
                            <button
                              className="btn btn-outline-primary btn-sm w-100 rounded-pill py-1 small"
                              onClick={() => handleUploadGalleryImages(tractor.id)}
                              disabled={uploadingId === tractor.id}
                            >
                              {uploadingId === tractor.id ? "Uploading..." : "Upload Selected Gallery Images"}
                            </button>
                          </div>

                          <div className="mt-auto pt-2 border-top d-flex justify-content-between gap-2">
                            <Link to={`/edit-tractor/${tractor.id}`} className="btn btn-outline-secondary btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1">
                              <FaEdit /> Edit Specs
                            </Link>
                            <button
                              className="btn btn-outline-danger btn-sm flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1"
                              onClick={() => handleDeleteTractor(tractor.id)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {selectedTractorForImplement && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-0 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaCogs className="text-success" /> Add Equipment Attachment
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTractorForImplement(null)}></button>
              </div>

              <form onSubmit={handleAddImplementSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-2 text-muted small">
                    Attaching equipment to: <strong>{selectedTractorForImplement.name}</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Attachment Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Shaktiman 36-Blade Rotavator"
                      value={implementFormData.name}
                      onChange={(e) => setImplementFormData({ ...implementFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Category *</label>
                    <select
                      className="form-select form-select-sm"
                      value={implementFormData.category}
                      onChange={(e) => setImplementFormData({ ...implementFormData, category: e.target.value })}
                    >
                      <option value="rotavator">Rotavator</option>
                      <option value="cultivator">Cultivator / Plough</option>
                      <option value="trailer">Trailer / Trolley</option>
                      <option value="harvester">Combine Harvester / Thresher</option>
                      <option value="seeder">Seed Drill / Seeder</option>
                      <option value="leveler">Laser Land Leveler</option>
                      <option value="other">Other Equipment</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small text-muted">Rent Per Day (₹) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={implementFormData.rent_per_day}
                        onChange={(e) => setImplementFormData({ ...implementFormData, rent_per_day: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small text-muted">Rent Per Hour (₹) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={implementFormData.rent_per_hour}
                        onChange={(e) => setImplementFormData({ ...implementFormData, rent_per_hour: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Description</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      placeholder="e.g. 6 feet rotavator suitable for wet and dry land plowing..."
                      value={implementFormData.description}
                      onChange={(e) => setImplementFormData({ ...implementFormData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm rounded-pill px-4" onClick={() => setSelectedTractorForImplement(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-tracto-primary btn-sm rounded-pill px-4 fw-bold" disabled={savingImplement}>
                    {savingImplement ? "Saving..." : "Add Equipment Attachment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTractors;