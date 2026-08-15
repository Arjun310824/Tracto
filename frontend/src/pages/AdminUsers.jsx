import { useState, useEffect } from "react";
import { FaUsers, FaBan, FaCheck, FaUserCircle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("accounts/users/");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await api.post(`accounts/users/${userId}/block/`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_blocked: res.data.is_blocked } : u)));
    } catch (err) {
      console.error("Error blocking user:", err);
      alert("Failed to change user block status.");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  });

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
              <h2 className="fw-extrabold text-dark m-0">User Management</h2>
              <p className="text-muted small">View all registered customers, owners, and administrators</p>
            </div>

            <div className="d-flex gap-2 mb-4 border-bottom pb-3">
              {["all", "customer", "owner", "admin"].map((role) => (
                <button
                  key={role}
                  className={`btn btn-sm rounded-pill text-capitalize px-3 ${roleFilter === role ? "btn-success fw-bold" : "btn-outline-secondary"}`}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}s
                </button>
              ))}
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
                        <th>User</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <FaUserCircle className="fs-4 text-secondary" />
                              <div>
                                <div className="fw-bold text-dark">{u.first_name} {u.last_name}</div>
                                <div className="text-muted small">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge rounded-pill text-uppercase ${u.role === 'owner' ? 'bg-warning text-dark' : u.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="small">{u.phone || 'N/A'}</td>
                          <td className="small">{u.district ? `${u.district}, ${u.state}` : 'N/A'}</td>
                          <td>
                            {u.is_blocked ? (
                              <span className="badge bg-danger">BLOCKED</span>
                            ) : (
                              <span className="badge bg-success">ACTIVE</span>
                            )}
                          </td>
                          <td>
                            {u.role !== "admin" && (
                              <button
                                className={`btn btn-sm rounded-pill px-3 ${u.is_blocked ? "btn-outline-success" : "btn-outline-danger"}`}
                                onClick={() => handleToggleBlock(u.id)}
                              >
                                {u.is_blocked ? <><FaCheck /> Unblock</> : <><FaBan /> Block</>}
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

export default AdminUsers;
