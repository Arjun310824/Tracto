import { useState, useEffect } from "react";
import { FaBookmark, FaCalendarAlt } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <h2 className="fw-extrabold text-dark m-0">All System Bookings</h2>
              <p className="text-muted small">Complete transaction logs of all tractor rental requests across the platform</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : (
              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>REF ID</th>
                        <th>Customer</th>
                        <th>Tractor</th>
                        <th>Owner</th>
                        <th>Rental Period</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-bold small">TRC{b.id.toString().padStart(5, "0")}</td>
                          <td className="small">{b.customer_details?.first_name || b.customer_details?.email}</td>
                          <td className="fw-semibold">{b.tractor_details?.name}</td>
                          <td className="small">{b.tractor_details?.owner_details?.first_name || 'Owner'}</td>
                          <td className="small">{b.start_date} to {b.end_date}</td>
                          <td className="fw-bold text-success">₹{b.total_amount}</td>
                          <td>
                            <span className={`badge rounded-pill text-uppercase ${b.status === 'completed' ? 'bg-success' : b.status === 'paid' ? 'bg-info text-dark' : b.status === 'approved' ? 'bg-primary' : b.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {b.status}
                            </span>
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
