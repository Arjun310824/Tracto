import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt, FaTachometerAlt, FaCog } from "react-icons/fa";
import api from "../api/axios";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

function TractorCard({ tractor, onWishlistToggle }) {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [isFav, setIsFav] = useState(tractor.is_favorite || false);
  const [loading, setLoading] = useState(false);

  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
  const defaultImg = `${BACKEND_BASE}/media/tractors/mahindra_gen.png`;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_BASE}${imagePath}`;
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("wishlist/toggle/", { tractor_id: tractor.id });
      setIsFav(res.data.is_favorite);
      if (onWishlistToggle) onWishlistToggle(tractor.id, res.data.is_favorite);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest(".favorite-btn") || e.target.closest(".tracto-btn") || e.target.closest("button")) {
      return;
    }
    navigate(`/tractor/${tractor.id}`);
  };

  return (
    <div
      className="tracto-card tracto-card-hoverable h-100"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* Favorite Button */}
      {user && user.role === "customer" && (
        <button
          className="favorite-btn"
          onClick={handleToggleFavorite}
          disabled={loading}
          title={isFav ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isFav ? <FaHeart className="text-danger fs-5" /> : <FaRegHeart className="text-secondary fs-5" />}
        </button>
      )}

      {/* Image Thumbnail */}
      <div className="overflow-hidden position-relative">
        <img
          src={getImageUrl(tractor.image)}
          className="tractor-card-img"
          alt={`${tractor.brand} ${tractor.model}`}
          onError={(e) => {
            e.target.src = defaultImg;
          }}
          loading="lazy"
        />
        {tractor.is_available === false && (
          <span className="position-absolute bottom-2 start-2 badge bg-danger text-white px-2.5 py-1 rounded-pill small">
            Currently Booked
          </span>
        )}
      </div>

      <div className="tracto-card-body p-3 d-flex flex-column">
        {/* Brand & Rating Header */}
        <div className="d-flex justify-content-between align-items-center mb-1.5">
          <Badge variant="primary" size="sm">
            {tractor.brand}
          </Badge>
          <div className="d-flex align-items-center gap-1 text-warning fw-bold small">
            <FaStar />
            <span>{tractor.avg_rating || "4.8"}</span>
            <span className="text-muted fw-normal">({tractor.total_reviews || 0})</span>
          </div>
        </div>

        {/* Tractor Title */}
        <h5 className="fw-bold text-dark mt-1 mb-2 text-truncate" title={tractor.name} style={{ fontSize: "1.05rem" }}>
          {tractor.name}
        </h5>

        {/* Specs Badges */}
        <div className="d-flex flex-wrap gap-1.5 mb-2.5 text-secondary small">
          <span className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded border text-muted">
            <FaTachometerAlt className="text-success" /> {tractor.horsepower} HP
          </span>
          <span className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded border text-muted text-capitalize">
            <FaCog className="text-primary" /> {tractor.fuel_type || "Diesel"}
          </span>
        </div>

        {/* Location */}
        <div className="text-muted small mb-3 d-flex align-items-center gap-1 text-truncate">
          <FaMapMarkerAlt className="text-danger flex-shrink-0" />
          <span className="text-truncate">{tractor.location || `${tractor.district || "Ahmedabad"}, ${tractor.state || "Gujarat"}`}</span>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-2.5 border-top d-flex justify-content-between align-items-center">
          <div>
            <span className="fs-5 fw-extrabold text-success font-heading">₹{tractor.rent_per_day}</span>
            <span className="text-muted small"> / day</span>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>₹{tractor.rent_per_hour}/hr</div>
          </div>

          {user && user.role === "owner" ? (
            tractor.owner === user.id || tractor.owner_details?.id === user.id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-tractor/${tractor.id}`);
                }}
              >
                ✏️ Edit
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tractor/${tractor.id}`);
                }}
              >
                Details
              </Button>
            )
          ) : user && user.role === "admin" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/admin-tractors");
              }}
            >
              Review
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/book-tractor/${tractor.id}`);
              }}
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TractorCard;
