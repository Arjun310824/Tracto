import { useState, useEffect } from "react";
import { FaStar, FaTrash, FaCommentDots } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("reviews/");
      setReviews(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;

    try {
      await api.delete(`reviews/${reviewId}/`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err.response?.data?.error || "Failed to delete review.");
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

          <div className="col-lg-9 col-xl-10 p-4">
            <div className="mb-4">
              <h2 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                <FaCommentDots className="text-warning" /> Customer Ratings & Reviews Moderation
              </h2>
              <p className="text-muted small">Monitor, view, and moderate customer ratings and reviews across all tractors</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaStar className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Reviews Submitted</h5>
                <p className="text-muted small">Customer reviews will appear here once submitted.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((r) => (
                  <div key={r.id} className="glass-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-bold text-dark fs-6">{r.customer_details?.first_name || "Customer"} {r.customer_details?.last_name || ""}</div>
                        <div className="text-muted small">Tractor: <span className="fw-semibold text-dark">{r.tractor_details?.name || "Tractor"}</span></div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="text-warning fw-bold d-flex align-items-center gap-1">
                          <FaStar /> {r.rating} / 5
                        </div>

                        <button className="btn btn-outline-danger btn-sm rounded-circle p-2" onClick={() => handleDeleteReview(r.id)} title="Delete Review">
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <p className="text-secondary small m-0 bg-light p-3 rounded-3 border">{r.comment}</p>
                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>Submitted on {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReviews;
