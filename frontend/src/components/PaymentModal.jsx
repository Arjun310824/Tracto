import { useState } from "react";
import { FaCreditCard, FaCheckCircle, FaLock, FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";

function PaymentModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paidSuccess, setPaidSuccess] = useState(false);

  const handlePayNow = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create order
      const orderRes = await api.post("payments/create-order/", {
        booking_id: booking.id,
      });

      const orderData = orderRes.data;

      // 2. Simulate Razorpay Checkout verification
      const verifyRes = await api.post("payments/verify/", {
        booking_id: booking.id,
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: `pay_${Date.now()}_razorpay_mock`,
        razorpay_signature: "mock_signature_success",
      });

      setPaidSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.error || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card border-0 p-3">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <FaCreditCard className="text-success" /> Secure Online Payment
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body py-4">
            {error && <div className="alert alert-danger small p-2">{error}</div>}

            {paidSuccess ? (
              <div className="text-center py-4">
                <FaCheckCircle className="text-success fs-1 mb-3 animate-bounce" />
                <h4 className="fw-bold text-dark">Payment Successful!</h4>
                <p className="text-muted small">Your booking TRC{booking.id.toString().padStart(5, '0')} has been confirmed.</p>
              </div>
            ) : (
              <>
                <div className="bg-light p-3 rounded-3 mb-4 border">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Booking Ref:</span>
                    <span className="fw-bold small">TRC{booking.id.toString().padStart(5, '0')}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Tractor:</span>
                    <span className="fw-semibold text-dark">{booking.tractor_details?.name || booking.tractor?.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Dates:</span>
                    <span className="small text-dark">{booking.start_date} to {booking.end_date}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark">Total Amount Due:</span>
                    <span className="fs-4 fw-extrabold text-success">₹{booking.total_amount}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted small bg-success-subtle text-success p-2.5 rounded mb-3">
                  <FaShieldAlt className="fs-5 flex-shrink-0" />
                  <span>Powered by <strong>Razorpay Test Mode Sandbox</strong>. 100% Encrypted & Safe.</span>
                </div>

                <button
                  className="btn btn-tracto-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={handlePayNow}
                  disabled={loading}
                >
                  <FaLock /> {loading ? "Processing Payment..." : `Pay ₹${booking.total_amount} Now`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
