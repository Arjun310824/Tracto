import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaSearch } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TractorCard from "../components/TractorCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

function Favorites() {
  const navigate = useNavigate();
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
    setWishlist(
      wishlist.filter(
        (item) => item.tractor_details?.id !== tractorId && item.tractor !== tractorId
      )
    );
  };

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
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading">❤️ Saved Wishlist</h1>
                <p className="text-muted small m-0 mt-0.5">Your saved machinery and tractors for fast seasonal booking</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/tractors")} icon={<FaSearch />}>
                Browse Catalog
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
                <p className="text-muted small mt-3">Loading saved wishlist...</p>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 shadow-sm my-2">
                <EmptyState
                  icon={<FaHeart />}
                  title="Your Wishlist is Empty"
                  description="Click the heart icon on any tractor card while exploring the catalog to bookmark machinery here."
                  action={
                    <Button variant="primary" size="sm" onClick={() => navigate("/tractors")} icon={<FaSearch />}>
                      Explore Tractors
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="row g-3 g-md-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="col-12 col-sm-6 col-xl-4">
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
