import { useState } from "react";
import { FaCreditCard, FaCheckCircle, FaLock, FaShieldAlt, FaMoneyBillWave, FaQrcode, FaUniversity } from "react-icons/fa";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

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
      // 1. Create order
      const orderRes = await api.post("payments/create-order/", {
        booking_id: booking.id,
      });

      const orderData = orderRes.data;

      // 2. Verify payment & record payment_method
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
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.error || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content glass-card border-0 p-3">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <FaShieldAlt className="text-success" /> 
              {lang === "gu" ? "ચૂકવણીનો પ્રકાર પસંદ કરો (Payment Options)" : "Select Payment Method"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body py-3">
            {error && <div className="alert alert-danger small p-2.5 rounded-3">{error}</div>}

            {paidSuccess ? (
              <div className="text-center py-4">
                <FaCheckCircle className="text-success display-3 mb-3 animate-bounce" />
                <h4 className="fw-bold text-dark">
                  {paymentMode === "cod" 
                    ? (lang === "gu" ? "બુકિંગ કન્ફર્મ થઈ ગયું! 🚜" : "Booking Confirmed!")
                    : (lang === "gu" ? "પેમેન્ટ સફળ થયું! 💳" : "Payment Successful!")}
                </h4>
                <p className="text-muted fs-6 mb-2">
                  TRC{booking.id.toString().padStart(5, '0')} - {booking.tractor_details?.name || booking.tractor?.name}
                </p>
                <div className="badge bg-success-subtle text-success fs-6 px-3 py-2 rounded-pill fw-bold border border-success border-opacity-25">
                  ✔ {selectedMethodText}
                </div>
              </div>
            ) : (
              <>
                {/* Summary Box */}
                <div className="bg-light p-3 rounded-4 mb-4 border">
                  <div className="row g-2 align-items-center">
                    <div className="col-sm-6">
                      <div className="text-muted small">Tractor / Machinery:</div>
                      <div className="fw-bold text-dark">{booking.tractor_details?.name || booking.tractor?.name}</div>
                    </div>
                    <div className="col-sm-6 text-sm-end">
                      <div className="text-muted small">Total Rental Amount:</div>
                      <div className="fs-4 fw-extrabold text-success">₹{booking.total_amount}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Options Selection Tabs */}
                <label className="form-label fw-bold text-dark mb-2">
                  {lang === "gu" ? "ચૂકવણી પદ્ધતિ પસંદ કરો:" : "Choose How You Want To Pay:"}
                </label>

                <div className="row g-3 mb-4">
                  {/* Option 1: Cash on Delivery / Pay Owner directly */}
                  <div className="col-md-4">
                    <div
                      className={`card h-100 p-3 rounded-4 border-2 cursor-pointer transition-all ${
                        paymentMode === "cod" ? "border-success bg-success-subtle shadow-sm" : "border-secondary-subtle bg-white"
                      }`}
                      onClick={() => setPaymentMode("cod")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaMoneyBillWave className="text-success fs-4" />
                        <h6 className="fw-bold mb-0 text-dark">
                          {lang === "gu" ? "રોકડેથી ચૂકવણી (Cash)" : "Cash on Delivery"}
                        </h6>
                      </div>
                      <p className="text-secondary small mb-0">
                        {lang === "gu" 
                          ? "કામ પૂરું થયા પછી ટ્રેક્ટર માલિકને સીધા રોકડા રૂ. " + booking.total_amount + " આપો."
                          : "Pay ₹" + booking.total_amount + " in cash directly to tractor owner after work."}
                      </p>
                      <span className="badge bg-success text-white rounded-pill mt-2 me-auto small">
                        {lang === "gu" ? "ખેડૂતો માટે લોકપ્રિય ⭐" : "Popular for Farmers"}
                      </span>
                    </div>
                  </div>

                  {/* Option 2: UPI / QR Code */}
                  <div className="col-md-4">
                    <div
                      className={`card h-100 p-3 rounded-4 border-2 cursor-pointer transition-all ${
                        paymentMode === "upi" ? "border-primary bg-primary-subtle shadow-sm" : "border-secondary-subtle bg-white"
                      }`}
                      onClick={() => setPaymentMode("upi")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaQrcode className="text-primary fs-4" />
                        <h6 className="fw-bold mb-0 text-dark">
                          {lang === "gu" ? "UPI (GPay/PhonePe)" : "UPI / QR Code"}
                        </h6>
                      </div>
                      <p className="text-secondary small mb-0">
                        {lang === "gu"
                          ? "Google Pay, PhonePe અથવા Paytm દ્વારા સ્કેન કરીને રૂ. " + booking.total_amount + " પે કરો."
                          : "Pay instant ₹" + booking.total_amount + " via Google Pay, PhonePe, or Paytm."}
                      </p>
                      <span className="badge bg-primary text-white rounded-pill mt-2 me-auto small">
                        Instant UPI
                      </span>
                    </div>
                  </div>

                  {/* Option 3: Card / Netbanking */}
                  <div className="col-md-4">
                    <div
                      className={`card h-100 p-3 rounded-4 border-2 cursor-pointer transition-all ${
                        paymentMode === "card" ? "border-warning bg-warning-subtle shadow-sm" : "border-secondary-subtle bg-white"
                      }`}
                      onClick={() => setPaymentMode("card")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaCreditCard className="text-warning fs-4" />
                        <h6 className="fw-bold mb-0 text-dark">
                          {lang === "gu" ? "કાર્ડ / નેટબેંકિંગ" : "Card / Netbanking"}
                        </h6>
                      </div>
                      <p className="text-secondary small mb-0">
                        {lang === "gu"
                          ? "એટીએમ કાર્ડ, ક્રેડિટ કાર્ડ અથવા નેટબેંકિંગ દ્વારા સુરક્ષિત ઓનલાઈન ચુકવણી."
                          : "Debit/Credit Card or Netbanking safe payment."}
                      </p>
                      <span className="badge bg-warning text-dark rounded-pill mt-2 me-auto small">
                        Razorpay Secured
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Details Box Based on Selection */}
                {paymentMode === "cod" && (
                  <div className="alert alert-success border-success-subtle rounded-3 small mb-4">
                    <strong>💡 {lang === "gu" ? "રોકડ ચૂકવણી વિગત:" : "Cash Payment Info:"}</strong>{" "}
                    {lang === "gu" 
                      ? "તમારું બુકિંગ તુરંત કન્ફર્મ થઈ જશે. ટ્રેક્ટર માલિક તમારા ખેતરે કામ પૂરું કરે ત્યારે તેમને રૂ. " + booking.total_amount + " રોકડા આપવાના રહેશે."
                      : "Your booking will be confirmed immediately. You will pay ₹" + booking.total_amount + " in cash to the owner after work."}
                  </div>
                )}

                {paymentMode === "upi" && (
                  <div className="alert alert-primary border-primary-subtle rounded-3 p-3 mb-4 text-center">
                    <div className="fw-bold mb-1">📱 UPI Scan & Pay ID: <code className="fs-6 text-dark">tracto@upi</code></div>
                    <div className="small text-muted">Google Pay • PhonePe • Paytm • BHIM UPI</div>
                  </div>
                )}

                {paymentMode === "card" && (
                  <div className="alert alert-warning border-warning-subtle rounded-3 small mb-4">
                    🔒 Powered by <strong>Razorpay Test Mode Sandbox</strong>. 100% Encrypted & Safe.
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  className="btn btn-success btn-lg w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={handleProcessPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      <span>Processing...</span>
                    </>
                  ) : paymentMode === "cod" ? (
                    <>
                      <FaMoneyBillWave /> {lang === "gu" ? "રોકડ ચૂકવણી પસંદ કરી બુકિંગ કન્ફર્મ કરો" : "Confirm Cash on Delivery Booking"}
                    </>
                  ) : (
                    <>
                      <FaLock /> {lang === "gu" ? "રૂ. " + booking.total_amount + " ની ઓનલાઈન ચૂકવણી કરો" : "Pay ₹" + booking.total_amount + " Now"}
                    </>
                  )}
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
