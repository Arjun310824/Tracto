import { useState, useEffect } from "react";
import { FaTractor, FaCheck, FaTimes, FaSearch, FaFilter, FaClock, FaCheckCircle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";

function AdminTractors() {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'approved'
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchTractors();
  }, []);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const res = await api.get("tractors/");
      setTractors(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching admin tractors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (tractorId) => {
    setActionLoading(tractorId);
    try {
      const res = await api.post(`tractors/${tractorId}/toggle_approval/`);
      setTractors(
        tractors.map((t) =>
          t.id === tractorId ? { ...t, is_approved_by_admin: res.data.is_approved_by_admin } : t
        )
      );
    } catch (err) {
      console.error("Error toggling approval:", err);
      alert("Failed to change tractor approval status.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTractors = tractors.filter((t) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pending"
        ? !t.is_approved_by_admin
        : t.is_approved_by_admin;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      t.name?.toLowerCase().includes(query) ||
      t.brand?.toLowerCase().includes(query) ||
      t.location?.toLowerCase().includes(query) ||
      t.owner_details?.first_name?.toLowerCase().includes(query) ||
      t.owner_details?.email?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = tractors.filter((t) => !t.is_approved_by_admin).length;
  const approvedCount = tractors.filter((t) => t.is_approved_by_admin).length;

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
                  <FaTractor style={{ color: "var(--primary-600)" }} /> Machinery Moderation
                </h1>
                <p className="text-secondary small mb-0">
                  Review and moderate tractors listed by owners before they appear on the public catalog.
                </p>
              </div>

              {/* Status Chips */}
              <div className="d-flex gap-2">
                <span
                  className="px-3 py-2 rounded-pill small fw-semibold d-flex align-items-center gap-2"
                  style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}
                >
                  <FaClock size={12} /> {pendingCount} Pending Review
                </span>
                <span
                  className="px-3 py-2 rounded-pill small fw-semibold d-flex align-items-center gap-2"
                  style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-700)" }}
                >
                  <FaCheckCircle size={12} /> {approvedCount} Live & Approved
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
                <Button
                  variant={filter === "all" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All Listings ({tractors.length})
                </Button>
                <Button
                  variant={filter === "pending" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                >
                  Pending ({pendingCount})
                </Button>
                <Button
                  variant={filter === "approved" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter("approved")}
                >
                  Approved ({approvedCount})
                </Button>
              </div>

              <div style={{ maxWidth: "320px", width: "100%" }}>
                <Input
                  icon={<FaSearch />}
                  placeholder="Search machinery, owner, district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>

            {/* Table or Empty State */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="tracto-spinner"
                  style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }}
                />
                <p className="text-muted small mt-3">Loading machinery database...</p>
              </div>
            ) : filteredTractors.length === 0 ? (
              <EmptyState
                icon={<FaTractor />}
                title="No tractors found"
                description={
                  searchQuery
                    ? "Try adjusting your search criteria."
                    : "No machinery listings match the selected status filter."
                }
                action={
                  searchQuery && (
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  )
                }
              />
            ) : (
              <div
                className="rounded-3 overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="table-responsive">
                  <table className="table align-middle mb-0" style={{ borderCollapse: "separate" }}>
                    <thead style={{ backgroundColor: "var(--slate-50)" }}>
                      <tr>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Tractor & Model
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Owner
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Specifications
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Rental Rates
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Location
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Approval Status
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTractors.map((t) => (
                        <tr
                          key={t.id}
                          style={{
                            borderTop: "1px solid var(--border-subtle)",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <td className="py-3 px-3">
                            <div className="fw-bold text-dark">{t.name}</div>
                            <div className="text-secondary small">
                              {t.brand} {t.model}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="small fw-semibold text-dark">
                              {t.owner_details?.first_name} {t.owner_details?.last_name || ""}
                            </div>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              {t.owner_details?.email}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="small text-dark fw-medium">{t.horsepower} HP</div>
                            <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>
                              {t.fuel_type || "Diesel"}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="fw-bold" style={{ color: "var(--primary-700)" }}>
                              ₹{t.rent_per_day} <span className="small text-muted fw-normal">/day</span>
                            </div>
                            {t.rent_per_hour && (
                              <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                ₹{t.rent_per_hour}/hr
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="small text-secondary">{t.location || "N/A"}</span>
                          </td>
                          <td className="py-3 px-3">
                            {t.is_approved_by_admin ? (
                              <Badge variant="success">APPROVED</Badge>
                            ) : (
                              <Badge variant="warning">PENDING</Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-end">
                            <Button
                              variant={t.is_approved_by_admin ? "danger" : "primary"}
                              size="sm"
                              loading={actionLoading === t.id}
                              onClick={() => handleToggleApproval(t.id)}
                            >
                              {t.is_approved_by_admin ? (
                                <>
                                  <FaTimes /> Revoke
                                </>
                              ) : (
                                <>
                                  <FaCheck /> Approve
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTractors;
