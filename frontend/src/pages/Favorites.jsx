import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaTractor } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TractorCard from "../components/TractorCard";

function Favorites() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get("wishlist/");
      setWishlist(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (tractorId) => {
    setWishlist(wishlist.filter((item) => item.tractor_details?.id !== tractorId && item.tractor !== tractorId));
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
            <div className="d-flex align-items-center gap-2 mb-4">
              <div>
                <h2 className="fw-extrabold text-dark m-0">❤️ My Favorites</h2>
                <p className="text-muted small m-0">Your favorite tractors saved for quick booking</p>
              </div>
            </div>


            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaHeart className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">Your Wishlist is Empty</h5>
                <p className="text-muted small">Click the heart icon on any tractor card to save it here.</p>
                <Link to="/tractors" className="btn btn-success rounded-pill px-4 btn-sm">
                  Explore Tractors
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="col-md-6 col-xl-4">
                    <TractorCard
                      tractor={{ ...item.tractor_details, is_favorite: true }}
                      onWishlistToggle={handleRemoveFavorite}
                    />
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

export default Favorites;
