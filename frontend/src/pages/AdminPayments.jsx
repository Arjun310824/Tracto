import { useState, useEffect } from "react";
import { FaCreditCard, FaCheckCircle, FaExclamationCircle, FaUndo } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

    try {
      await api.post(`payments/${paymentId}/refund/`);
      fetchPayments();
    } catch (err) {
      console.error("Error issuing refund:", err);
      alert(err.response?.data?.error || "Failed to refund payment.");
    }
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
            <div className="mb-4">
              <h2 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                <FaCreditCard className="text-success" /> Admin Payments & Transactions
              </h2>
              <p className="text-muted small">View customer payments, Razorpay order IDs, transaction statuses, and issue refunds</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="glass-card p-5 text-center my-4">
                <FaCreditCard className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold">No Payments Recorded</h5>
                <p className="text-muted small">No payment transactions have been logged on the platform yet.</p>
              </div>
            ) : (
              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-bold small">{p.razorpay_payment_id || `PAY-${p.id}`}</td>
                          <td className="small text-muted">{p.razorpay_order_id || 'N/A'}</td>
                          <td className="fw-extrabold text-success">₹{p.amount}</td>
                          <td className="small">{p.payment_method}</td>
                          <td className="small">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge rounded-pill text-uppercase ${p.status === 'success' ? 'bg-success' : p.status === 'refunded' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            {p.status === "success" && (
                              <button
                                className="btn btn-outline-warning text-dark btn-sm rounded-pill py-1 px-3 d-flex align-items-center gap-1 fw-bold"
                                onClick={() => handleRefund(p.id)}
                              >
                                <FaUndo /> Refund
                              </button>
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
