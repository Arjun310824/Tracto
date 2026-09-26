import { useState, useEffect } from "react";
import {
  FaRupeeSign,
  FaUniversity,
  FaArrowDown,
  FaCheckCircle,
  FaPercent,
  FaHistory,
  FaBuilding,
  FaCreditCard,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { RevenueTrendChart } from "../components/AnalyticsCharts";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

function OwnerEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [bankData, setBankData] = useState({
    bank_name: "State Bank of India",
    account_number: "38910245678",
    ifsc_code: "SBIN0001234",
    account_holder: "Ramesh Patel",
    upi_id: "9876543210@sbi",
  });

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await api.get("payments/owner-earnings/");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching owner earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSubmitting(true);

    try {
      const res = await api.post("payments/request-payout/", bankData);
      setMsg(res.data.message);
      fetchEarnings();
    } catch (error) {
      console.error("Error requesting payout:", error);
      setErr(error.response?.data?.error || "Failed to process bank transfer payout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-app)" }}>
        <Navbar />
        <div className="text-center py-5 my-auto">
          <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
          <p className="text-muted small mt-3">Loading financial earnings...</p>
        </div>
      </div>
    );
  }

  const grossRevenue = data?.gross_revenue || 0;
  const commissionAmount = data?.commission_amount || 0;
  const netEarnings = data?.net_earnings || 0;
  const availableBalance = data?.available_balance || 0;
  const withdrawnTotal = data?.total_payout_withdrawn || 0;
  const payoutsHistory = data?.payouts_history || [];

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
            <div className="mb-4">
              <h1 className="h3 fw-extrabold text-dark m-0 font-heading d-flex align-items-center gap-2">
                <FaRupeeSign className="text-success" /> Daily Earnings & Direct Bank Payouts
              </h1>
              <p className="text-muted small m-0 mt-0.5">
                View gross booking revenue, 10% platform commission, and transfer net earnings directly to your bank account
              </p>
            </div>

            {/* 4 Financial Key Metrics */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Gross Booking Revenue"
                  value={`₹${grossRevenue.toLocaleString()}`}
                  icon={<FaRupeeSign />}
                  variant="info"
                  subtext="Total farmer payments received"
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Platform Fee (10%)"
                  value={`₹${commissionAmount.toLocaleString()}`}
                  icon={<FaPercent />}
                  variant="warning"
                  subtext="GPS & maintenance support fee"
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Net Revenue Earned"
                  value={`₹${netEarnings.toLocaleString()}`}
                  icon={<FaCheckCircle />}
                  variant="success"
                  subtext="Net owner earnings after fee"
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  label="Available for Payout"
                  value={`₹${availableBalance.toLocaleString()}`}
                  icon={<FaUniversity />}
                  variant="accent"
                  subtext={`Withdrawn: ₹${withdrawnTotal.toLocaleString()}`}
                />
              </div>
            </div>

            {/* Main Content Grid: Direct Payout Form + Revenue Chart */}
            <div className="row g-4 mb-4">
              {/* Left Column: Bank Account / UPI Payout Form */}
              <div className="col-12 col-lg-6">
                <div className="bg-white rounded-4 border p-4 shadow-sm h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-extrabold text-dark m-0 font-heading d-flex align-items-center gap-2">
                      <FaUniversity className="text-success" /> Direct Bank Transfer Payout
                    </h5>
                    <Badge variant="success">Available: ₹{availableBalance.toLocaleString()}</Badge>
                  </div>

                  {msg && (
                    <div className="alert alert-success p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FaCheckCircle /> <span>{msg}</span>
                    </div>
                  )}
                  {err && (
                    <div className="alert alert-danger p-2.5 rounded-3 mb-3 small d-flex align-items-center gap-2">
                      <FaExclamationTriangle /> <span>{err}</span>
                    </div>
                  )}

                  <form onSubmit={handlePayoutSubmit}>
                    <div className="row g-2 mb-2">
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Bank Name *"
                          value={bankData.bank_name}
                          onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Account Holder Name *"
                          value={bankData.account_holder}
                          onChange={(e) => setBankData({ ...bankData, account_holder: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-12 col-sm-6">
                        <Input
                          label="Account Number *"
                          value={bankData.account_number}
                          onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <Input
                          label="IFSC Code *"
                          value={bankData.ifsc_code}
                          onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Input
                        label="UPI ID (Instant Payout Option)"
                        placeholder="e.g. 9876543210@sbi"
                        value={bankData.upi_id}
                        onChange={(e) => setBankData({ ...bankData, upi_id: e.target.value })}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={availableBalance <= 0 || submitting}
                      isLoading={submitting}
                      loadingText="Initiating Bank Transfer..."
                      icon={<FaArrowDown />}
                    >
                      {availableBalance > 0
                        ? `Transfer ₹${availableBalance.toLocaleString()} to Bank Now`
                        : "No Available Balance for Transfer"}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Right Column: Earnings Chart */}
              <div className="col-12 col-lg-6">
                <div className="bg-white rounded-4 border p-4 shadow-sm h-100">
                  <h5 className="fw-extrabold text-dark mb-3 pb-2 border-bottom font-heading">
                    📈 Revenue Performance
                  </h5>
                  <RevenueTrendChart />
                </div>
              </div>
            </div>

            {/* Payout Transfer History Table */}
            <div className="bg-white rounded-4 border p-4 shadow-sm">
              <h5 className="fw-extrabold text-dark mb-3 pb-2 border-bottom font-heading d-flex align-items-center gap-2">
                <FaHistory className="text-muted" /> Payout Transfer History
              </h5>

              {payoutsHistory.length === 0 ? (
                <div className="text-center py-4 text-muted small">No withdrawal requests processed yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Transaction Ref</th>
                        <th>Bank / UPI</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutsHistory.map((p, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold font-monospace small">PAY-{p.id || idx + 1001}</td>
                          <td>
                            <div className="fw-semibold text-dark">{p.bank_name || "State Bank of India"}</div>
                            <small className="text-muted">{p.account_number || p.upi_id}</small>
                          </td>
                          <td className="small text-muted">{new Date(p.created_at || Date.now()).toLocaleDateString()}</td>
                          <td className="fw-bold text-success font-monospace">₹{p.amount || availableBalance}</td>
                          <td>
                            <Badge variant={p.status === "completed" ? "success" : "info"} size="sm">
                              {p.status || "Processed"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerEarnings;
