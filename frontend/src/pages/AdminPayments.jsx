import { useState, useEffect } from "react";
import { FaCreditCard, FaCheckCircle, FaExclamationCircle, FaUndo, FaSearch } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("payments/history/");
      setPayments(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching admin payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm("Are you sure you want to issue a refund for this payment?")) return;

    setActionLoading(paymentId);
    try {
      await api.post(`payments/${paymentId}/refund/`);
      await fetchPayments();
    } catch (err) {
      console.error("Error issuing refund:", err);
      alert(err.response?.data?.error || "Failed to refund payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesFilter = statusFilter === "all" ? true : p.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.razorpay_payment_id?.toLowerCase().includes(query) ||
      p.razorpay_order_id?.toLowerCase().includes(query) ||
      p.payment_method?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const totalProcessed = payments
    .filter((p) => p.status === "success")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

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
                  <FaCreditCard style={{ color: "var(--primary-600)" }} /> Payments & Settlements
                </h1>
                <p className="text-secondary small mb-0">
                  Track transaction statuses, Razorpay order IDs, gateway settlement logs, and manage refunds.
                </p>
              </div>

              {/* Total volume chips */}
              <div className="d-flex gap-2 flex-wrap">
                <span
                  className="px-3 py-2 rounded-pill small fw-semibold"
                  style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-700)" }}
                >
                  Processed: ₹{totalProcessed.toLocaleString()}
                </span>
                {totalRefunded > 0 && (
                  <span
                    className="px-3 py-2 rounded-pill small fw-semibold"
                    style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}
                  >
                    Refunded: ₹{totalRefunded.toLocaleString()}
                  </span>
                )}
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
                {["all", "success", "refunded", "failed"].map((status) => (
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
                  placeholder="Search Payment or Order ID..."
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
                <p className="text-muted small mt-3">Loading transaction ledger...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <EmptyState
                icon={<FaCreditCard />}
                title="No payment records found"
                description={
                  searchQuery
                    ? "Try adjusting your search criteria."
                    : "There are currently no transactions matching this status."
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
                      Clear Filters
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
                          Payment Ref
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Gateway Order ID
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Amount
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Method
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Date
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                          Status
                        </th>
                        <th className="py-3 px-3 text-secondary small fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((p) => (
                        <tr
                          key={p.id}
                          style={{
                            borderTop: "1px solid var(--border-subtle)",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <td className="py-3 px-3">
                            <span className="font-monospace small fw-bold text-dark">
                              {p.razorpay_payment_id || `PAY-${p.id}`}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-monospace small text-muted">
                              {p.razorpay_order_id || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="fw-bold" style={{ color: "var(--primary-700)" }}>
                              ₹{parseFloat(p.amount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="small text-uppercase fw-medium text-secondary">
                              {p.payment_method || "Online"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="small text-muted">
                              {new Date(p.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {p.status === "success" ? (
                              <Badge variant="success">SUCCESS</Badge>
                            ) : p.status === "refunded" ? (
                              <Badge variant="warning">REFUNDED</Badge>
                            ) : (
                              <Badge variant="danger">{p.status?.toUpperCase() || "FAILED"}</Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-end">
                            {p.status === "success" && (
                              <Button
                                variant="outline"
                                size="sm"
                                loading={actionLoading === p.id}
                                onClick={() => handleRefund(p.id)}
                                title="Issue Gateway Refund"
                              >
                                <FaUndo size={11} /> Refund
                              </Button>
                            )}
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

export default AdminPayments;
