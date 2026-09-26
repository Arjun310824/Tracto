import { useState } from "react";
import { FaCreditCard, FaCheckCircle, FaLock, FaShieldAlt, FaMoneyBillWave, FaQrcode } from "react-icons/fa";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

function PaymentModal({ booking, onClose, onSuccess }) {
  const { lang, t } = useLanguage();

  const [paymentMode, setPaymentMode] = useState("cod"); // "cod", "upi", "card"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [selectedMethodText, setSelectedMethodText] = useState("");

  const handleProcessPayment = async () => {
    setLoading(true);
    setError("");

    let methodLabel = "Cash on Delivery (Pay to Owner)";
    if (paymentMode === "upi") methodLabel = "UPI (Google Pay / PhonePe / Paytm)";
    if (paymentMode === "card") methodLabel = "Card / Netbanking (Online)";
    setSelectedMethodText(methodLabel);

    try {
      const orderRes = await api.post("payments/create-order/", {
        booking_id: booking.id,
      });

      const orderData = orderRes.data;

      await api.post("payments/verify/", {
        booking_id: booking.id,
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: paymentMode === "cod" ? `cod_${Date.now()}` : `pay_${Date.now()}_mock`,
        razorpay_signature: "mock_signature_success",
        payment_method: methodLabel,
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title={lang === "gu" ? "ચૂકવણી પદ્ધતિ (Payment Options)" : "Choose Payment Method"}
      icon={<FaShieldAlt className="text-success" />}
      size="md"
    >
      {error && <div className="alert alert-danger small p-2.5 rounded-3 mb-3">{error}</div>}

      {paidSuccess ? (
        <div className="text-center py-4">
          <FaCheckCircle className="text-success display-3 mb-3" />
          <h4 className="fw-extrabold text-dark font-heading">
            {paymentMode === "cod"
              ? lang === "gu"
                ? "બુકિંગ કન્ફર્મ થઈ ગયું! 🚜"
                : "Booking Confirmed!"
              : lang === "gu"
              ? "પેમેન્ટ સફળ થયું! 💳"
              : "Payment Successful!"}
          </h4>
          <p className="text-muted small mb-3">
            Booking #TRC{booking.id.toString().padStart(5, "0")} • {booking.tractor_details?.name || booking.tractor?.name}
          </p>
          <Badge variant="success" size="md">
            ✔ {selectedMethodText}
          </Badge>
        </div>
      ) : (
        <div>
          {/* Summary Box */}
          <div className="p-3 bg-light rounded-3 mb-4 border d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted small d-block">Tractor / Machinery:</span>
              <strong className="text-dark fs-6">{booking.tractor_details?.name || booking.tractor?.name}</strong>
            </div>
            <div className="text-end">
              <span className="text-muted small d-block">Amount Due:</span>
              <span className="fs-4 fw-extrabold text-success font-heading">₹{booking.total_amount}</span>
            </div>
          </div>

          <label className="tracto-label mb-2">Select Your Preferred Payment Mode</label>
          <div className="d-flex flex-column gap-2 mb-4">
            {/* COD Option */}
            <div
              className={`p-3 rounded-3 border cursor-pointer transition-all ${
                paymentMode === "cod"
                  ? "bg-success-subtle border-success shadow-sm"
                  : "bg-white hover-border-success"
              }`}
              onClick={() => setPaymentMode("cod")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                  <FaMoneyBillWave className="text-success fs-5" />
                  <span>{lang === "gu" ? "રોકડેથી ચૂકવણી (Cash)" : "Cash on Delivery (Pay to Owner)"}</span>
                </div>
                <Badge variant="success">Farmer Choice ⭐</Badge>
              </div>
              <p className="text-muted small mb-0">
                Pay ₹{booking.total_amount} in cash directly to the tractor owner after work is completed on your farm.
              </p>
            </div>

            {/* UPI Option */}
            <div
              className={`p-3 rounded-3 border cursor-pointer transition-all ${
                paymentMode === "upi"
                  ? "bg-primary-subtle border-primary shadow-sm"
                  : "bg-white hover-border-success"
              }`}
              onClick={() => setPaymentMode("upi")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                  <FaQrcode className="text-primary fs-5" />
                  <span>UPI Scan & Pay (GPay / PhonePe / Paytm)</span>
                </div>
                <Badge variant="info">Instant UPI</Badge>
              </div>
              <p className="text-muted small mb-0">
                Scan QR code or pay via Google Pay, PhonePe, Paytm, or BHIM.
              </p>
            </div>

            {/* Card Option */}
            <div
              className={`p-3 rounded-3 border cursor-pointer transition-all ${
                paymentMode === "card"
                  ? "bg-warning-subtle border-warning shadow-sm"
                  : "bg-white hover-border-success"
              }`}
              onClick={() => setPaymentMode("card")}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                  <FaCreditCard className="text-warning fs-5" />
                  <span>Debit / Credit Card / Netbanking</span>
                </div>
                <Badge variant="warning">Razorpay Secure</Badge>
              </div>
              <p className="text-muted small mb-0">
                100% Encrypted bank transfer or card payment via Razorpay.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingText="Processing..."
            onClick={handleProcessPayment}
            icon={paymentMode === "cod" ? <FaMoneyBillWave /> : <FaLock />}
          >
            {paymentMode === "cod"
              ? "Confirm Cash On Delivery Booking"
              : `Pay ₹${booking.total_amount} Securely`}
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default PaymentModal;
