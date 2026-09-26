import { useState, useEffect } from "react";
import { FaBookmark, FaCalendarAlt, FaSearch, FaFilter, FaRupeeSign, FaTractor, FaUser } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("bookings/");
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching system bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">COMPLETED</Badge>;
      case "paid":
        return <Badge variant="info">PAID</Badge>;
      case "approved":
        return <Badge variant="primary">APPROVED</Badge>;
      case "pending":
        return <Badge variant="warning">PENDING</Badge>;
      case "cancelled":
      case "rejected":
        return <Badge variant="danger">{status.toUpperCase()}</Badge>;
      default:
        return <Badge variant="neutral">{status?.toUpperCase() || "UNKNOWN"}</Badge>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const refCode = `TRC${b.id.toString().padStart(5, "0")}`.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      refCode.includes(query) ||
      b.tractor_details?.name?.toLowerCase().includes(query) ||
      b.customer_details?.first_name?.toLowerCase().includes(query) ||
      b.customer_details?.email?.toLowerCase().includes(query) ||
      b.tractor_details?.owner_details?.first_name?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalRevenue = bookings
    .filter((b) => b.status === "completed" || b.status === "paid")
    .reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0);

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
                  <FaBookmark style={{ color: "var(--primary-600)" }} /> Platform Bookings Log
                </h1>
                <p className="text-secondary small mb-0">
                  Comprehensive audit trail of all machinery reservations, rental schedules, and settlements.
                </p>
              </div>

              {/* Volume stats */}
              <div className="d-flex gap-2 flex-wrap">
                <span
                  className="px-3 py-2 rounded-pill small fw-semibold"
                  style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-700)" }}
                >
                  {bookings.length} Total Bookings
                </span>
                <span
                  className="px-3 py-2 rounded-pill small fw-semibold"
                  style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}
                >
                  ₹{totalRevenue.toLocaleString()} Settled Volume
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
                {["all", "pending", "approved", "paid", "completed", "cancelled"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>

              <div style={{ maxWidth: "300px", width: "100%" }}>
                <Input
                  icon={<FaSearch />}
                  placeholder="Search REF ID, farmer, tractor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>

            {/* Bookings Table */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="tracto-spinner"
                  style={{ width: "2.5rem", height: "2.5rem", color: "var(--primary-600)" }}
                />
                <p className="text-muted small mt-3">Loading booking records...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState
                icon={<FaBookmark />}
                title="No bookings match"
                description={
                  searchQuery
                    ? "Try adjusting your search criteria."
                    : "There are no bookings recorded with the selected filter."
                }
                action={
                  (searchQuery || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Reset Filters
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
                          REF ID
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Renter (Customer)
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Equipment
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Owner
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Schedule
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Amount
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          style={{
                            borderTop: "1px solid var(--border-subtle)",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <td className="py-3 px-3">
                            <span className="font-monospace fw-bold small text-dark">
                              TRC{b.id.toString().padStart(5, "0")}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="small fw-semibold text-dark">
                              {b.customer_details?.first_name || "Customer"}{" "}
                              {b.customer_details?.last_name || ""}
                            </div>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              {b.customer_details?.email}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="fw-medium text-dark small">{b.tractor_details?.name}</div>
                            <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>
                              {b.tractor_details?.brand}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="small text-dark">
                              {b.tractor_details?.owner_details?.first_name || "Owner"}{" "}
                              {b.tractor_details?.owner_details?.last_name || ""}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="small text-dark d-flex align-items-center gap-1">
                              <FaCalendarAlt size={11} className="text-muted" />
                              <span>{b.start_date}</span>
                            </div>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              to {b.end_date}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="fw-bold" style={{ color: "var(--primary-700)" }}>
                              ₹{parseFloat(b.total_amount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-end">
                            {getStatusBadge(b.status)}
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

export default AdminBookings;
