import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaFilter, FaSearch, FaRedo, FaTractor } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TractorCard from "../components/TractorCard";

function TractorList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [startDate, setStartDate] = useState(searchParams.get("start_date") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end_date") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [minHp, setMinHp] = useState(searchParams.get("min_hp") || "");
  const [maxHp, setMaxHp] = useState(searchParams.get("max_hp") || "");
  const [available, setAvailable] = useState(searchParams.get("available") || "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "newest");

  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTractors();
  }, [searchParams]);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const res = await api.get(`tractors/?${params.toString()}`);
      setTractors(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error loading tractors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (brand) params.set("brand", brand);
    if (location) params.set("location", location);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minHp) params.set("min_hp", minHp);
    if (maxHp) params.set("max_hp", maxHp);
    if (available) params.set("available", available);
    if (sortBy) params.set("sort_by", sortBy);
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearch("");
    setBrand("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setMinPrice("");
    setMaxPrice("");
    setMinHp("");
    setMaxHp("");
    setAvailable("true");
    setSortBy("newest");
    setSearchParams({});
  };


  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">
        {/* Header Title */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="fw-extrabold text-dark m-0">Explore & Search Tractors</h2>
            <p className="text-muted small m-0">Find top performance farming tractors by brand, price, horsepower, and location</p>
          </div>
          <span className="badge bg-success-subtle text-success fs-6 border border-success-subtle px-3 py-2">
            {tractors.length} Tractors Found
          </span>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className="filter-box shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FaFilter className="text-success fs-6" /> Tractor Filters
                </h5>
                <button className="btn btn-link text-decoration-none p-0 text-muted small d-flex align-items-center gap-1" onClick={handleReset}>
                  <FaRedo /> Reset
                </button>
              </div>

              <form onSubmit={handleApplyFilter}>
                {/* Keyword Search */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Search Name / Model</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. Mahindra 575"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location / District */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold small text-muted mb-0">Location / District</label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-success fw-bold text-decoration-none small"
                      onClick={() => {
                        const user = JSON.parse(localStorage.getItem("user") || "null");
                        const userLoc = user?.district || "Ahmedabad";
                        setLocation(userLoc);
                        const params = new URLSearchParams(searchParams);
                        params.set("location", userLoc);
                        setSearchParams(params);
                      }}
                    >
                      📍 Tractors Near Me
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Ahmedabad, Sanand, Anand"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <span className="text-muted" style={{ fontSize: "0.7rem" }}>🗺️ Filter by State, District, City, Village, or Pincode</span>
                </div>

                {/* Filter Available By Work Dates */}
                <div className="mb-3 bg-light p-2 rounded border">
                  <label className="form-label fw-semibold small text-dark d-flex align-items-center gap-1 mb-1">
                    📅 Check Availability Dates
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <span className="text-muted" style={{ fontSize: "0.7rem" }}>Only show tractors free during these dates</span>
                </div>



                {/* Brand Selector */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Brand</label>
                  <select className="form-select form-select-sm" value={brand} onChange={(e) => setBrand(e.target.value)}>
                    <option value="">All Brands</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="Swaraj">Swaraj</option>
                    <option value="John Deere">John Deere</option>
                    <option value="Sonalika">Sonalika</option>
                    <option value="Farmtrac">Farmtrac</option>
                    <option value="Eicher">Eicher</option>
                    <option value="New Holland">New Holland</option>
                    <option value="Kubota">Kubota</option>
                  </select>
                </div>

                {/* Rent Price Range */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Price Range (₹ / Day)</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Min ₹"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Max ₹"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Horsepower Range */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Horsepower (HP)</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Min HP"
                        value={minHp}
                        onChange={(e) => setMinHp(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Max HP"
                        value={maxHp}
                        onChange={(e) => setMaxHp(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Availability Status</label>
                  <select className="form-select form-select-sm" value={available} onChange={(e) => setAvailable(e.target.value)}>
                    <option value="true">Available Now</option>
                    <option value="">All Tractors</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-muted">Sort Results By</label>
                  <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest Listed</option>
                    <option value="lowest_price">Lowest Price (₹)</option>
                    <option value="highest_price">Highest Price (₹)</option>
                    <option value="rating">Highest Customer Rating ⭐</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-tracto-primary w-100 btn-sm rounded-pill fw-bold py-2">
                  <FaSearch /> Search Tractors
                </button>
              </form>
            </div>
          </div>

          {/* Tractor Cards Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : tractors.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaTractor className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Tractors Found</h5>
                <p className="text-muted small">Try broadening your search inputs or resetting the filters.</p>
                <button className="btn btn-outline-success btn-sm rounded-pill px-4" onClick={handleReset}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {tractors.map((tractor) => (
                  <div key={tractor.id} className="col-md-6 col-xl-4">
                    <TractorCard tractor={tractor} />
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

export default TractorList;