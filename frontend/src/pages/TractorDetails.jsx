import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaTachometerAlt, FaCog, FaCalendarAlt, FaGasPump, FaPhone, FaUserCheck, FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function TractorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [tractor, setTractor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchTractorAndReviews();
  }, [id]);

  const fetchTractorAndReviews = async () => {
    try {
      const res = await api.get(`tractors/${id}/`);
      setTractor(res.data);

      const rRes = await api.get(`reviews/?tractor_id=${id}`);
      setReviews(rRes.data.results || rRes.data || []);
    } catch (err) {
      console.error("Error fetching tractor details:", err);
    } finally {
      setLoading(false);
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

  if (!tractor) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container py-5 text-center">
          <h4 className="fw-bold">Tractor Not Found</h4>
          <Link to="/tractors" className="btn btn-success rounded-pill px-4 mt-3">Back to Tractors</Link>
        </div>
      </div>
    );
  }

  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
  const defaultImg = `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;
  const mainImage = tractor.image ? (tractor.image.startsWith("http") ? tractor.image : `${BACKEND_BASE}${tractor.image}`) : defaultImg;

  const galleryImages = [mainImage];
  if (tractor.additional_images && tractor.additional_images.length > 0) {
    tractor.additional_images.forEach((imgObj) => {
      const url = imgObj.image.startsWith("http") ? imgObj.image : `${BACKEND_BASE}${imgObj.image}`;
      galleryImages.push(url);
    });
  }


  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">
        <Link to="/tractors" className="btn btn-outline-secondary btn-sm rounded-pill mb-3 d-inline-flex align-items-center gap-1">
          <FaArrowLeft /> Back to Tractors
        </Link>

        <div className="row g-4">
          {/* Main Content & Gallery */}
          <div className="col-lg-8">
            <div className="card glass-card border-0 overflow-hidden mb-4">
              {/* Active Main Gallery Display */}
              <div className="position-relative cursor-pointer" onClick={() => setShowImageModal(true)} title="Click to view full photo">
                <img
                  src={galleryImages[activeImgIndex] || mainImage}
                  alt={tractor.name}
                  className="w-100 cursor-pointer"
                  style={{ height: 420, objectFit: "cover", cursor: "pointer" }}
                  onError={(e) => { e.target.src = defaultImg; }}
                />
                <span className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white small px-3 py-1 m-3 rounded-pill fw-semibold">
                  🔍 Click for Fullscreen Photo
                </span>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="d-flex gap-2 p-3 bg-dark overflow-auto">
                  {galleryImages.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt="Thumbnail"
                      className={`rounded cursor-pointer ${activeImgIndex === idx ? "border border-3 border-success" : "opacity-75"}`}
                      style={{ width: 80, height: 60, objectFit: "cover", cursor: "pointer" }}
                      onClick={() => setActiveImgIndex(idx)}
                    />
                  ))}
                </div>
              )}

              {/* Fullscreen Photo Lightbox Modal */}
              {showImageModal && (
                <div
                  className="modal show d-block z-3"
                  style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
                  onClick={() => setShowImageModal(false)}
                >
                  <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content bg-transparent border-0 text-center">
                      <div className="d-flex justify-content-end p-2">
                        <button type="button" className="btn-close btn-close-white fs-4" onClick={() => setShowImageModal(false)}></button>
                      </div>
                      <img
                        src={galleryImages[activeImgIndex] || mainImage}
                        alt={tractor.name}
                        className="img-fluid rounded-3 shadow-lg mx-auto"
                        style={{ maxHeight: "80vh", objectFit: "contain" }}
                      />
                      <div className="text-white mt-3 fw-bold fs-5">{tractor.name} ({tractor.brand})</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="badge bg-success-subtle text-success fw-bold me-2 px-2.5 py-1">{tractor.brand}</span>
                    <span className="badge bg-light text-dark border fw-normal">{tractor.model}</span>
                    <h2 className="fw-extrabold text-dark mt-2 mb-1">{tractor.name}</h2>
                    <p className="text-muted small m-0 d-flex align-items-center gap-1.5 flex-wrap">
                      <FaMapMarkerAlt className="text-danger" /> 
                      <span className="fw-semibold text-dark">{tractor.location}</span>
                      {tractor.city_village && <span className="badge bg-light text-secondary border">Village: {tractor.city_village}</span>}
                      {tractor.district && <span className="badge bg-light text-secondary border">District: {tractor.district}</span>}
                      {tractor.state && <span className="badge bg-light text-secondary border">State: {tractor.state}</span>}
                      {tractor.pincode && <span className="badge bg-light text-secondary border">PIN: {tractor.pincode}</span>}
                    </p>
                    <div className="mt-2">
                      <a
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${tractor.location}, ${tractor.district || 'Ahmedabad'}, ${tractor.state || 'Gujarat'}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-success btn-sm rounded-pill py-0.5 px-2.5 text-decoration-none"
                        style={{ fontSize: "0.75rem" }}
                      >
                        🗺️ View on OpenStreetMap
                      </a>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-5 justify-content-end">
                      <FaStar /> {tractor.avg_rating || "4.8"}
                    </div>
                    <span className="text-muted small">({tractor.total_reviews || 0} Customer Reviews)</span>
                  </div>
                </div>

                <hr className="my-4" />


                {/* Key Specifications Grid */}
                <h5 className="fw-bold text-dark mb-3">Tractor Specifications</h5>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <FaTachometerAlt className="text-success fs-4 mb-1" />
                      <div className="text-muted small">Horsepower</div>
                      <div className="fw-bold text-dark">{tractor.horsepower} HP</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <FaCog className="text-primary fs-4 mb-1" />
                      <div className="text-muted small">Transmission</div>
                      <div className="fw-bold text-dark text-capitalize">{tractor.transmission || "Manual"}</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <FaGasPump className="text-warning fs-4 mb-1" />
                      <div className="text-muted small">Fuel Type</div>
                      <div className="fw-bold text-dark text-capitalize">{tractor.fuel_type || "Diesel"}</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <FaCalendarAlt className="text-info fs-4 mb-1" />
                      <div className="text-muted small">Mfg Year</div>
                      <div className="fw-bold text-dark">{tractor.manufacturing_year || 2023}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <h5 className="fw-bold text-dark mb-2">Description</h5>
                <p className="text-secondary leading-relaxed mb-4">{tractor.description || "Well maintained heavy duty tractor suitable for all farm plowing, rotavator, and hauling work."}</p>

                {/* Available Equipment Attachments Section */}
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <FaCog className="text-success" /> Owner's Equipment Attachments
                </h5>

                {!tractor.attached_implements || tractor.attached_implements.length === 0 ? (
                  <div className="alert alert-light border small text-muted mb-4">
                    ℹ️ The owner has not listed any extra equipment attachments for this tractor.
                  </div>
                ) : (
                  <div className="row g-3 mb-4">
                    {tractor.attached_implements.map((impl) => (
                      <div key={impl.id} className="col-md-6">
                        <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-dark">{impl.name}</div>
                            <div className="text-muted small mb-1">{impl.description || "Farm equipment attachment"}</div>
                            <span className="badge bg-success text-white">₹{impl.rent_per_day}/day (₹{impl.rent_per_hour}/hr)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customer Reviews Section */}
                <h5 className="fw-bold text-dark mb-3">Customer Ratings & Reviews</h5>

                {reviews.length === 0 ? (
                  <p className="text-muted small">No written reviews yet for this tractor.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 bg-light rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-dark">{r.customer_details?.first_name || "Customer"}</span>
                          <div className="text-warning small d-flex align-items-center gap-1">
                            <FaStar /> {r.rating} / 5
                          </div>
                        </div>
                        <p className="text-secondary small m-0">{r.comment}</p>
                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Booking Widget & Owner Card */}
          <div className="col-lg-4">
            <div className="card glass-card border-0 p-4 sticky-top mb-4" style={{ top: 80 }}>
              <div className="mb-3">
                <span className="text-muted small d-block">Rental Pricing</span>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="display-6 fw-extrabold text-success">₹{tractor.rent_per_day}</span>
                  <span className="text-muted">/ day</span>
                </div>
                <div className="text-muted small">Hourly Rate: ₹{tractor.rent_per_hour}/hr</div>
              </div>

              <div className="bg-success-subtle p-3 rounded-3 mb-4 text-success small border border-success-subtle">
                ✔ Instant Availability Confirmation <br />
                ✔ Direct Contact with Tractor Owner <br />
                ✔ Secure Online Payment Option
              </div>

              {/* Role-Specific Action Button */}
              {user && user.role === "owner" ? (
                tractor.owner === user.id || tractor.owner_details?.id === user.id ? (
                  <Link to={`/edit-tractor/${tractor.id}`} className="btn btn-outline-success w-100 py-3 rounded-pill fw-bold text-center mb-3">
                    ✏️ Edit My Tractor Listing
                  </Link>
                ) : (
                  <div className="alert alert-warning text-center small mb-3 py-2">
                    🚜 You are logged in as an <strong>Equipment Owner</strong>.
                  </div>
                )
              ) : user && user.role === "admin" ? (
                <Link to="/admin-tractors" className="btn btn-outline-primary w-100 py-3 rounded-pill fw-bold text-center mb-3">
                  🛡️ Manage Tractor in Admin Portal
                </Link>
              ) : (
                <Link to={`/book-tractor/${tractor.id}`} className="btn btn-tracto-primary w-100 py-3 rounded-pill fw-bold text-center mb-3">
                  Book This Tractor
                </Link>
              )}

              {/* Owner Info Box */}
              <div className="border-top pt-3 mt-2">
                <h6 className="fw-bold text-dark mb-2">Tractor Owner Details</h6>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white p-2.5 rounded-circle">
                    <FaUserCheck className="fs-5" />
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{tractor.owner_details?.first_name || "Ramesh"} {tractor.owner_details?.last_name || "Patel"}</div>
                    <div className="text-muted small"><FaPhone className="text-primary" /> {tractor.owner_details?.phone || "Contact via booking"}</div>
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

export default TractorDetails;
