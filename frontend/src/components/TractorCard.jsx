import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt, FaTachometerAlt, FaCog } from "react-icons/fa";
import api from "../api/axios";

function TractorCard({ tractor, onWishlistToggle }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [isFav, setIsFav] = useState(tractor.is_favorite || false);
  const [loading, setLoading] = useState(false);

  const defaultImg = "http://127.0.0.1:8000/media/tractors/mahindra_gen.png";


  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:8000${imagePath}`;
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
    // If user clicked on favorite heart button or Book Now button, don't navigate to details
    if (e.target.closest(".favorite-btn") || e.target.closest(".btn-tracto-primary")) {
      return;
    }
    navigate(`/tractor/${tractor.id}`);
  };

  return (
    <div
      className="card glass-card h-100 border-0 overflow-hidden position-relative cursor-pointer"
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
        >
          {isFav ? <FaHeart className="text-danger fs-5" /> : <FaRegHeart className="text-secondary fs-5" />}
        </button>
      )}

      {/* Image Thumbnail */}
      <img
        src={getImageUrl(tractor.image)}
        className="tractor-card-img"
        alt={`${tractor.brand} ${tractor.model}`}
        onError={(e) => { e.target.src = defaultImg; }}
      />

      <div className="card-body p-3.5 d-flex flex-column">
        {/* Brand & Rating */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold px-2 py-1">
            {tractor.brand}
          </span>
          <div className="d-flex align-items-center gap-1 text-warning fw-bold small">
            <FaStar />
            <span>{tractor.avg_rating || "4.8"}</span>
            <span className="text-muted font-weight-normal">({tractor.total_reviews || 0})</span>
          </div>
        </div>

        {/* Tractor Title */}
        <h5 className="card-title fw-bold text-dark mt-1 mb-2 text-truncate" title={tractor.name}>
          {tractor.name}
        </h5>

        {/* Specs Badges */}
        <div className="d-flex flex-wrap gap-2 mb-3 text-secondary small">
          <span className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
            <FaTachometerAlt className="text-success" /> {tractor.horsepower} HP
          </span>
          <span className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded text-capitalize">
            <FaCog className="text-primary" /> {tractor.fuel_type || "Diesel"}
          </span>
        </div>

        {/* Location */}
        <div className="text-muted small mb-3 d-flex align-items-center gap-1 text-truncate">
          <FaMapMarkerAlt className="text-danger flex-shrink-0" />
          <span>{tractor.location || `${tractor.district}, ${tractor.state}`}</span>
        </div>

        {/* Pricing & Actions CTA */}
        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
          <div>
            <span className="fs-5 fw-extrabold text-success">₹{tractor.rent_per_day}</span>
            <span className="text-muted small"> / day</span>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>₹{tractor.rent_per_hour}/hr</div>
          </div>

          <Link to={`/book-tractor/${tractor.id}`} className="btn btn-tracto-primary btn-sm rounded-pill px-3">
            Book Now
          </Link>
        </div>

      </div>
    </div>
  );
}



export default TractorCard;

