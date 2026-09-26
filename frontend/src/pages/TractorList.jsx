import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaFilter, FaSearch, FaRedo, FaTractor, FaTimes, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TractorCard from "../components/TractorCard";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

function TractorList() {
  const { t } = useLanguage();
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

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate active filter count
  const activeFilterCount = [
    brand,
    location,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    minHp,
    maxHp,
    available !== "true" ? available : null,
  ].filter(Boolean).length;

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
    if (search.trim()) params.set("search", search.trim());
    if (brand) params.set("brand", brand);
    if (location.trim()) params.set("location", location.trim());
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minHp) params.set("min_hp", minHp);
    if (maxHp) params.set("max_hp", maxHp);
    if (available) params.set("available", available);
    if (sortBy) params.set("sort_by", sortBy);
    setSearchParams(params);
    setMobileFilterOpen(false);
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
    setMobileFilterOpen(false);
  };

  const renderFilterForm = () => (
    <form onSubmit={handleApplyFilter}>
      {/* Keyword Search */}
      <div className="mb-3">
        <label className="tracto-label">Search Model / Name</label>
        <div className="tracto-input-wrapper has-icon-left">
          <span className="tracto-input-icon left"><FaSearch /></span>
          <input
            type="text"
            className="tracto-input"
            placeholder={t("searchPlaceholder") || "e.g. Mahindra 575 DI"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Location / District */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="tracto-label mb-0">Location / District</label>
          <button
            type="button"
            className="btn btn-link p-0 text-success fw-bold text-decoration-none small"
            style={{ fontSize: "0.75rem" }}
            onClick={() => {
              const user = JSON.parse(localStorage.getItem("user") || "null");
              const userLoc = user?.district || "Ahmedabad";
              setLocation(userLoc);
            }}
          >
            📍 Near Me
          </button>
        </div>
        <div className="tracto-input-wrapper has-icon-left">
          <span className="tracto-input-icon left"><FaMapMarkerAlt /></span>
          <input
            type="text"
            className="tracto-input"
            placeholder="e.g. Sanand, Anand, Mehsana"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Availability Dates */}
      <div className="mb-3 p-2.5 rounded-3 bg-light border">
        <label className="tracto-label mb-1.5 d-flex align-items-center gap-1.5">
          <FaCalendarAlt className="text-success" /> Work Date Range
        </label>
        <div className="row g-2">
          <div className="col-6">
            <input
              type="date"
              className="tracto-input bg-white"
              style={{ minHeight: 38, fontSize: "0.8125rem" }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
          </div>
          <div className="col-6">
            <input
              type="date"
              className="tracto-input bg-white"
              style={{ minHeight: 38, fontSize: "0.8125rem" }}
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Brand Selector */}
      <div className="mb-3">
        <label className="tracto-label">Brand</label>
        <div className="tracto-input-wrapper">
          <select
            className="tracto-input"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
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
      </div>

      {/* Rent Price Range */}
      <div className="mb-3">
        <label className="tracto-label">Price Range (₹ / Day)</label>
        <div className="row g-2">
          <div className="col-6">
            <div className="tracto-input-wrapper">
              <input
                type="number"
                className="tracto-input"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="tracto-input-wrapper">
              <input
                type="number"
                className="tracto-input"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Horsepower Range */}
      <div className="mb-3">
        <label className="tracto-label">Horsepower (HP)</label>
        <div className="row g-2">
          <div className="col-6">
            <div className="tracto-input-wrapper">
              <input
                type="number"
                className="tracto-input"
                placeholder="Min HP"
                value={minHp}
                onChange={(e) => setMinHp(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="tracto-input-wrapper">
              <input
                type="number"
                className="tracto-input"
                placeholder="Max HP"
                value={maxHp}
                onChange={(e) => setMaxHp(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className="mb-3">
        <label className="tracto-label">Availability Status</label>
        <div className="tracto-input-wrapper">
          <select
            className="tracto-input"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
          >
            <option value="true">Available Now</option>
            <option value="">All Tractors</option>
          </select>
        </div>
      </div>

      {/* Sort Results */}
      <div className="mb-4">
        <label className="tracto-label">Sort Results By</label>
        <div className="tracto-input-wrapper">
          <select
            className="tracto-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest Listed</option>
            <option value="lowest_price">Lowest Price (₹ / day)</option>
            <option value="highest_price">Highest Price (₹ / day)</option>
            <option value="rating">Highest Customer Rating ⭐</option>
          </select>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          icon={<FaSearch />}
        >
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          title="Reset filters"
        >
          <FaRedo />
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Header Title & Mobile Controls */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="h2 fw-extrabold text-dark m-0 font-heading">{t("exploreTitle") || "Agricultural Fleet Catalog"}</h1>
            <p className="text-muted small m-0 mt-0.5">
              Find top-performance farming tractors by brand, horsepower, implements, and rental rates
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Badge variant="success" size="md">
              {tractors.length} {t("available") || "Available"}
            </Badge>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              className="btn btn-outline-success btn-sm rounded-pill d-lg-none d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <FaFilter />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="badge bg-success text-white rounded-pill px-1.5 py-0.5" style={{ fontSize: "0.7rem" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Filter Expandable Drawer */}
        {mobileFilterOpen && (
          <div className="d-lg-none mb-4 p-3 bg-white rounded-4 border shadow-md">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <FaFilter className="text-success" /> Filter Tractors
              </h5>
              <button
                type="button"
                className="btn btn-link p-1 text-muted"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <FaTimes className="fs-5" />
              </button>
            </div>
            {renderFilterForm()}
          </div>
        )}

        <div className="row g-4">
          {/* Desktop Filters Sidebar */}
          <aside className="col-lg-3 d-none d-lg-block">
            <div className="filter-box shadow-sm sticky-top" style={{ top: 90 }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2 font-heading fs-6">
                  <FaFilter className="text-success fs-6" /> Filter Catalog
                </h5>
                {activeFilterCount > 0 && (
                  <button
                    className="btn btn-link text-decoration-none p-0 text-muted small d-flex align-items-center gap-1"
                    onClick={handleReset}
                  >
                    <FaRedo /> Reset ({activeFilterCount})
                  </button>
                )}
              </div>
              {renderFilterForm()}
            </div>
          </aside>

          {/* Tractor Cards Grid */}
          <div className="col-12 col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="tracto-spinner" style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }} />
                <p className="text-muted small mt-2">Searching available machinery...</p>
              </div>
            ) : tractors.length === 0 ? (
              <div className="bg-white rounded-4 p-5 border shadow-sm my-2">
                <EmptyState
                  icon={<FaTractor />}
                  title="No Tractors Found"
                  description="We couldn't find any tractors matching your search filters. Try adjusting your brand, location, or price filters."
                  action={
                    <Button variant="outline" size="sm" onClick={handleReset} icon={<FaRedo />}>
                      Reset All Filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="row g-3 g-md-4">
                {tractors.map((tractor) => (
                  <div key={tractor.id} className="col-12 col-sm-6 col-xl-4">
                    <TractorCard tractor={tractor} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TractorList;