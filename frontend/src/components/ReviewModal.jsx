import { useState } from "react";
import { FaStar } from "react-icons/fa";
import api from "../api/axios";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Rate & Review Experience"
      size="md"
    >
      {error && <div className="alert alert-danger small p-2.5 rounded-3 mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3 p-3 bg-light rounded-3 border">
          <span className="text-muted small d-block">Tractor / Machinery:</span>
          <strong className="text-dark fs-6">{booking.tractor_details?.name || booking.tractor?.name}</strong>
        </div>

        {/* Star Selection */}
        <div className="mb-4 text-center">
          <label className="tracto-label justify-content-center mb-2">Your Rating Score</label>
          <div className="d-flex justify-content-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`fs-2 cursor-pointer transition-all ${
                  star <= rating ? "text-warning" : "text-muted opacity-25"
                }`}
                onClick={() => setRating(star)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
          <div className="mt-2 fw-bold text-dark font-heading">{rating} out of 5 Stars</div>
        </div>

        {/* Comment Textarea */}
        <div className="mb-4">
          <label className="tracto-label">Your Review Feedback *</label>
          <textarea
            className="tracto-input p-3 rounded-3 border"
            rows="3"
            placeholder="Share details on equipment condition, timeliness, and operator performance..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", outline: "none", borderColor: "var(--border-subtle)" }}
            required
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            loadingText="Submitting..."
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ReviewModal;
