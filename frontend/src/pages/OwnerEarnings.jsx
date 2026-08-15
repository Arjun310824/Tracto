import { useState, useEffect } from "react";
import { FaRupeeSign, FaUniversity, FaArrowDown, FaCheckCircle, FaPercent, FaHistory, FaBuilding, FaCreditCard, FaLock } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
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
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-xl-10 p-4">
            <div className="mb-4">
              <h2 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                <FaRupeeSign className="text-success" /> Daily Earnings & Direct Bank Payouts
              </h2>
              <p className="text-muted small">View gross booking revenue, 10% platform commission deduction, and transfer net earnings directly to your bank account</p>
            </div>

            {/* 4 Financial Summary KPI Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary p-3 rounded-circle fs-4">
                    <FaRupeeSign />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Gross Rental Revenue</div>
                    <div className="fs-4 fw-extrabold text-dark">₹{grossRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning p-3 rounded-circle fs-4">
                    <FaPercent />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Platform Fee (10%)</div>
                    <div className="fs-4 fw-extrabold text-danger">-₹{commissionAmount.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-success-subtle text-success p-3 rounded-circle fs-4">
                    <FaUniversity />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Net Earnings (90%)</div>
                    <div className="fs-4 fw-extrabold text-success">₹{netEarnings.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="glass-card p-3 d-flex align-items-center gap-3">
                  <div className="bg-info-subtle text-info p-3 rounded-circle fs-4">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Withdrawn to Bank</div>
                    <div className="fs-4 fw-extrabold text-primary">₹{withdrawnTotal.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Bank Account Payout Transfer Box */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="glass-card p-4 h-100">
                  <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <FaUniversity className="text-success" /> Instant Direct Bank Transfer Payout
                  </h5>
                  <p className="text-muted small mb-3">Transfer your net earnings directly to your registered bank account</p>

                  <div className="bg-success-subtle p-3 rounded-3 mb-4 border border-success-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small fw-bold">Available Payout Balance:</div>
                      <div className="fs-2 fw-extrabold text-success">₹{availableBalance.toLocaleString()}</div>
                    </div>
                    <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">Ready for Payout</span>
                  </div>

                  {msg && <div className="alert alert-success p-2.5 small mb-3 rounded-3">{msg}</div>}
                  {err && <div className="alert alert-danger p-2.5 small mb-3 rounded-3">{err}</div>}

                  <form onSubmit={handlePayoutSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-muted">Account Holder Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={bankData.account_holder}
                        onChange={(e) => setBankData({ ...bankData, account_holder: e.target.value })}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">Bank Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={bankData.bank_name}
                          onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">IFSC Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm text-uppercase"
                          value={bankData.ifsc_code}
                          onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">Account Number *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={bankData.account_number}
                          onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small text-muted">UPI ID (Optional)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="name@upi"
                          value={bankData.upi_id}
                          onChange={(e) => setBankData({ ...bankData, upi_id: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-tracto-primary w-100 py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                      disabled={submitting || availableBalance <= 0}
                    >
                      <FaLock /> {submitting ? "Processing Transfer..." : `Transfer ₹${availableBalance.toLocaleString()} to Bank Account`}
                    </button>
                  </form>
                </div>
              </div>

              {/* Bank Transfer History Table */}
              <div className="col-lg-6">
                <div className="glass-card p-4 h-100">
                  <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <FaHistory className="text-primary" /> Bank Payout History
                  </h5>
                  <p className="text-muted small mb-3">Record of all past direct bank payouts and platform commission deductions</p>

                  {payoutsHistory.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No bank payout transfers requested yet.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Ref ID</th>
                            <th>Bank Account</th>
                            <th>Net Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payoutsHistory.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <div className="fw-bold text-dark small">{p.reference_id}</div>
                                <div className="text-muted" style={{ fontSize: "0.7rem" }}>{new Date(p.created_at).toLocaleDateString()}</div>
                              </td>
                              <td>
                                <div className="fw-semibold small">{p.bank_name}</div>
                                <div className="text-muted" style={{ fontSize: "0.7rem" }}>A/C: ...{p.account_number.slice(-4)}</div>
                              </td>
                              <td className="fw-extrabold text-success">₹{parseFloat(p.net_payout).toLocaleString()}</td>
                              <td>
                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill py-1 px-2.5 small fw-bold">
                                  Bank Transfer Successful ✔
                                </span>
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
      </div>
    </div>
  );
}

export default OwnerEarnings;
