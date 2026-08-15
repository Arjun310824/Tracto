import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPrint, FaTractor, FaArrowLeft, FaCheckCircle, FaFileContract, FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";

function InvoiceView() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`bookings/${bookingId}/`);
      setBooking(res.data);
    } catch (err) {
      console.error("Error loading invoice booking:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">Invoice not found.</div>
        <Link to="/my-bookings" className="btn btn-primary rounded-pill">Back to Bookings</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const invoiceNum = `TRC-${booking.id.toString().padStart(6, "0")}`;

  return (
    <div className="bg-light min-vh-100 py-4">
      {/* Non-printable action header */}
      <div className="container no-print mb-4 d-flex justify-content-between align-items-center" style={{ maxWidth: 850 }}>
        <Link to="/my-bookings" className="btn btn-outline-secondary rounded-pill px-3.5 btn-sm d-flex align-items-center gap-1.5">
          <FaArrowLeft /> Back to My Bookings
        </Link>

        <button className="btn btn-tracto-primary rounded-pill px-4 btn-sm d-flex align-items-center gap-2 fw-bold" onClick={handlePrint}>
          <FaPrint /> Print Tax Invoice & Farmer Agreement PDF
        </button>
      </div>

      <div className="container" style={{ maxWidth: 850 }}>
        {/* Printable Card Container */}
        <div className="card glass-card border-0 p-4 p-md-5 shadow-lg bg-white position-relative">

          {/* PAID Watermark Stamp */}
          <div
            className="position-absolute top-50 start-50 translate-middle pointer-events-none text-uppercase fw-extrabold select-none opacity-10 border border-5 border-success p-3 rounded-4"
            style={{
              fontSize: "5rem",
              color: "#16a34a",
              transform: "translate(-50%, -50%) rotate(-25deg)",
              letterSpacing: "0.2em",
              zIndex: 1,
            }}
          >
            PAID ✔
          </div>

          {/* Invoice Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 fw-bold text-success fs-3 mb-1">
                <FaTractor /> TRACTO
              </div>
              <p className="text-muted small m-0">Smart Tractor & Agri Equipment Rental Platform</p>
              <p className="text-muted small m-0">Gujarat, India • Helpline: +91 98765 43210</p>
            </div>

            <div className="text-end">
              <span className="badge bg-success fs-6 px-3 py-1.5 rounded-pill mb-2">TAX INVOICE</span>
              <h5 className="fw-extrabold text-dark m-0">{invoiceNum}</h5>
              <div className="text-muted small">Date: {new Date(booking.created_at || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Customer & Tractor Details Grid */}
          <div className="row mb-4">
            <div className="col-6">
              <h6 className="fw-bold text-dark text-uppercase small mb-2">Billed To (Customer):</h6>
              <div className="fw-bold text-dark fs-6">{booking.customer_details?.first_name ? `${booking.customer_details.first_name} ${booking.customer_details.last_name || ''}` : booking.customer_details?.email}</div>
              <div className="text-muted small">{booking.customer_details?.phone || "+91 91234 56789"}</div>
              <div className="text-muted small">{booking.customer_details?.village ? `${booking.customer_details.village}, ${booking.customer_details.district}` : "Ahmedabad, Gujarat"}</div>
            </div>

            <div className="col-6 text-end">
              <h6 className="fw-bold text-dark text-uppercase small mb-2">Tractor & Owner Details:</h6>
              <div className="fw-bold text-dark fs-6">{booking.tractor_details?.name} ({booking.tractor_details?.brand})</div>
              <div className="text-muted small">Owner: {booking.tractor_details?.owner_details?.first_name || "Ramesh Patel"}</div>
              <div className="text-muted small">Location: {booking.tractor_details?.location || "Sanand, Ahmedabad"}</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th>Rental Type</th>
                  <th>Duration</th>
                  <th className="text-end">Rate</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="fw-semibold text-dark">{booking.tractor_details?.name}</div>
                    <div className="text-muted small">From {booking.start_date} to {booking.end_date}</div>
                  </td>
                  <td className="text-capitalize">{booking.rental_duration_type}</td>
                  <td>{booking.rental_units} {booking.rental_duration_type === "hourly" ? "Hours" : "Days"}</td>
                  <td className="text-end">₹{booking.tractor_details?.rent_per_day || 2500}</td>
                  <td className="text-end fw-bold text-dark">₹{booking.total_amount}</td>
                </tr>
                {booking.implement_details && booking.implement_details.map((impl) => (
                  <tr key={impl.id}>
                    <td>
                      <div className="fw-semibold text-dark">Attachment: {impl.name}</div>
                      <div className="text-muted small">Equipment add-on</div>
                    </td>
                    <td className="text-capitalize">{booking.rental_duration_type}</td>
                    <td>{booking.rental_units} {booking.rental_duration_type === "hourly" ? "Hours" : "Days"}</td>
                    <td className="text-end">₹{impl.rent_per_day}</td>
                    <td className="text-end fw-bold text-dark">₹{impl.rent_per_day * booking.rental_units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="row justify-content-end mb-4">
            <div className="col-md-5">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Subtotal:</span>
                <span className="fw-semibold text-dark">₹{booking.total_amount}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">GST (0% Agri Exemption):</span>
                <span className="fw-semibold text-dark">₹0.00</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between py-1">
                <span className="fw-extrabold text-dark fs-5">Total Paid:</span>
                <span className="fs-4 fw-extrabold text-success">₹{booking.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Farmer Rental Agreement Contract Section */}
          <div className="border-top pt-4 mt-4 page-break-before">
            <div className="d-flex align-items-center gap-2 fw-bold text-dark fs-5 mb-2">
              <FaFileContract className="text-success" /> ખેડૂત ટ્રેક્ટર ભાડા કરારપત્ર (Agri Rental Agreement)
            </div>
            <p className="text-muted small mb-3">Legal Tractor Rental Terms & Condition Agreement between Owner & Farmer Customer</p>

            <div className="bg-light p-3 rounded-3 border small leading-relaxed mb-4">
              <p className="mb-2">
                <strong>૧. પક્ષકારો (Parties):</strong> આ ટ્રેક્ટર ભાડા કરાર ટ્રેક્ટર માલિક <strong>{booking.tractor_details?.owner_details?.first_name || "માલિક"}</strong> અને ખેડૂત ગ્રાહક <strong>{booking.customer_details?.first_name || "ગ્રાહક"}</strong> વચ્ચે TRACTO પ્લેટફોર્મ દ્વારા સંમતિપૂર્વક થયો છે.
              </p>
              <p className="mb-2">
                <strong>૨. ભાડાનો સમયગાળો (Rental Period):</strong> ટ્રેક્ટર <strong>{booking.tractor_details?.name}</strong> નો ઉપયોગ તારીખ <strong>{booking.start_date}</strong> થી તારીખ <strong>{booking.end_date}</strong> સુધી કુલ <strong>{booking.rental_units} {booking.rental_duration_type === "daily" ? "દિવસ" : "કલાક"}</strong> માટે જ કરવાનો રહેશે.
              </p>
              <p className="mb-2">
                <strong>૩. ડીઝલ અને સંભાળ (Fuel & Maintenance):</strong> ભાડા સમયગાળા દરમિયાન ડીઝલનો ખર્ચ ગ્રાહકે ભોગવવાનો રહેશે તેમજ ટ્રેક્ટરને કોઈ નુકસાન ન થાય તેની કાળજી રાખવાની રહેશે.
              </p>
              <p className="mb-0">
                <strong>૪. પરત ચુકવણી (Return Terms):</strong> કામ પૂર્ણ થયા બાદ નક્કી કરેલી તારીખે ટ્રેક્ટર માલિકને યોગ્ય સ્થિતિમાં પરત સોંપવાનું રહેશે.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="row pt-4 text-center">
              <div className="col-6">
                <div className="border-bottom pb-4 mb-2" style={{ borderStyle: "dashed" }}></div>
                <div className="fw-bold text-dark small">માલિકની સહી (Tractor Owner Signature)</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{booking.tractor_details?.owner_details?.first_name || "Owner"}</div>
              </div>
              <div className="col-6">
                <div className="border-bottom pb-4 mb-2" style={{ borderStyle: "dashed" }}></div>
                <div className="fw-bold text-dark small">ખેડૂત ગ્રાહકની સહી (Customer Signature)</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{booking.customer_details?.first_name || "Customer"}</div>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="border-top pt-3 mt-4 text-center text-muted small">
            <p className="m-0">Thank you for choosing <strong>TRACTO Rental Platform</strong> for your agricultural needs.</p>
            <p className="m-0">This is a verified digital invoice and farmer rental agreement generated via TRACTO System.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
