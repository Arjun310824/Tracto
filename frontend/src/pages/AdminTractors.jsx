import { useState, useEffect } from "react";
import { FaTractor, FaCheck, FaTimes, FaStar } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminTractors() {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTractors();
  }, []);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const res = await api.get("tractors/");
      setTractors(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching admin tractors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (tractorId) => {
    try {
      const res = await api.post(`tractors/${tractorId}/toggle_approval/`);
      setTractors(tractors.map((t) => (t.id === tractorId ? { ...t, is_approved_by_admin: res.data.is_approved_by_admin } : t)));
    } catch (err) {
      console.error("Error toggling approval:", err);
      alert("Failed to change tractor approval status.");
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
              <h2 className="fw-extrabold text-dark m-0">Tractor Listing Moderation</h2>
              <p className="text-muted small">Approve or unapprove tractors submitted by owners</p>
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
                        <th>Tractor</th>
                        <th>Owner</th>
                        <th>Specs</th>
                        <th>Rate / Day</th>
                        <th>Location</th>
                        <th>Approval Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tractors.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <div className="fw-bold text-dark">{t.name}</div>
                            <div className="text-muted small">{t.brand} {t.model}</div>
                          </td>
                          <td>
                            <div className="small fw-semibold">{t.owner_details?.first_name} {t.owner_details?.last_name}</div>
                            <div className="text-muted small">{t.owner_details?.email}</div>
                          </td>
                          <td className="small">{t.horsepower} HP • {t.fuel_type}</td>
                          <td className="fw-bold text-success">₹{t.rent_per_day}</td>
                          <td className="small">{t.location}</td>
                          <td>
                            {t.is_approved_by_admin ? (
                              <span className="badge bg-success">APPROVED</span>
                            ) : (
                              <span className="badge bg-warning text-dark">PENDING APPROVAL</span>
                            )}
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm rounded-pill px-3 ${t.is_approved_by_admin ? "btn-outline-danger" : "btn-success"}`}
                              onClick={() => handleToggleApproval(t.id)}
                            >
                              {t.is_approved_by_admin ? "Revoke Approval" : "Approve Listing"}
                            </button>
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

export default AdminTractors;
