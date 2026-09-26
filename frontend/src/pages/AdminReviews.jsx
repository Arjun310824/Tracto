import { useState, useEffect } from "react";
import { FaStar, FaTrash, FaCommentDots, FaSearch, FaUser, FaTractor } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

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

    setActionLoading(reviewId);
    try {
      await api.delete(`reviews/${reviewId}/`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err.response?.data?.error || "Failed to delete review.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRating =
      ratingFilter === "all" ? true : r.rating === parseInt(ratingFilter, 10);

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.customer_details?.first_name?.toLowerCase().includes(query) ||
      r.customer_details?.last_name?.toLowerCase().includes(query) ||
      r.tractor_details?.name?.toLowerCase().includes(query) ||
      r.comment?.toLowerCase().includes(query);

    return matchesRating && matchesSearch;
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <div className="container-fluid flex-grow-1">
        <div className="row">
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar />
          </div>

          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h1 className="h3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <FaCommentDots style={{ color: "var(--warning)" }} /> Reviews & Feedback Moderation
                </h1>
                <p className="text-secondary small mb-0">
                  Inspect user ratings, customer testimonials, and remove inappropriate or spam comments.
                </p>
              </div>

              {/* Stats chip */}
              <div className="d-flex gap-2">
                <span
                  className="px-3 py-2 rounded-pill small fw-semibold d-flex align-items-center gap-2"
                  style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}
                >
                  <FaStar size={13} /> {averageRating} / 5.0 Avg Rating ({reviews.length} total)
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div
              className="p-3 mb-4 rounded-3 d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center justify-content-between"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="d-flex gap-2 flex-wrap">
                {["all", "5", "4", "3", "2", "1"].map((r) => (
                  <Button
                    key={r}
                    variant={ratingFilter === r ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setRatingFilter(r)}
                  >
                    {r === "all" ? "All Stars" : `${r} ★`}
                  </Button>
                ))}
              </div>

              <div style={{ maxWidth: "300px", width: "100%" }}>
                <Input
                  icon={<FaSearch />}
                  placeholder="Search reviews or tractors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>

            {/* Reviews List */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="tracto-spinner"
                  style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }}
                />
                <p className="text-muted small mt-3">Loading customer reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                icon={<FaStar />}
                title="No reviews found"
                description={
                  searchQuery
                    ? "Try adjusting your search criteria."
                    : "There are currently no reviews matching this filter."
                }
                action={
                  (searchQuery || ratingFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setRatingFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )
                }
              />
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-3"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                          style={{
                            width: "42px",
                            height: "42px",
                            backgroundColor: "var(--primary-600)",
                            flexShrink: 0,
                          }}
                        >
                          {r.customer_details?.first_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {r.customer_details?.first_name || "Customer"}{" "}
                            {r.customer_details?.last_name || ""}
                          </div>
                          <div className="text-secondary small d-flex align-items-center gap-1">
                            <FaTractor size={11} style={{ color: "var(--primary-600)" }} />
                            <span>{r.tractor_details?.name || "Tractor"}</span>
                            <span className="text-muted">({r.tractor_details?.brand || ""})</span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-1" style={{ color: "var(--warning)" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={14}
                              style={{
                                color: star <= r.rating ? "var(--warning)" : "var(--slate-200)",
                              }}
                            />
                          ))}
                          <span className="fw-bold ms-1 text-dark small">{r.rating}.0</span>
                        </div>

                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === r.id}
                          onClick={() => handleDeleteReview(r.id)}
                          title="Delete review"
                        >
                          <FaTrash size={12} />
                        </Button>
                      </div>
                    </div>

                    <p
                      className="text-secondary small mb-2 p-3 rounded-2"
                      style={{
                        backgroundColor: "var(--slate-50)",
                        border: "1px solid var(--border-subtle)",
                        lineHeight: 1.6,
                      }}
                    >
                      "{r.comment}"
                    </p>

                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                      Submitted on{" "}
                      {new Date(r.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
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
