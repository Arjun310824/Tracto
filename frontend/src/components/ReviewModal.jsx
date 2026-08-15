import { useState } from "react";
import { FaStar } from "react-icons/fa";
import api from "../api/axios";

function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("reviews/", {
        booking: booking.id,
        rating,
        comment,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.error || err.response?.data?.booking?.[0] || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block tab-modal-bg" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card border-0 p-2">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark">Leave a Rating & Review</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger small p-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">Tractor</label>
                <div className="fw-bold fs-6">{booking.tractor_details?.name || booking.tractor?.name}</div>
              </div>

              {/* Star Selection */}
              <div className="mb-4 text-center">
                <label className="form-label fw-semibold text-muted small d-block mb-2">Your Rating</label>
                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`fs-2 cursor-pointer transition-all ${star <= rating ? "text-warning" : "text-secondary opacity-50"}`}
                      onClick={() => setRating(star)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </div>
                <div className="mt-2 fw-semibold text-dark">{rating} out of 5 Stars</div>
              </div>

              {/* Comment Textarea */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">Your Review Comment</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Share your experience with this tractor and owner..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-tracto-primary rounded-pill px-4" disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
