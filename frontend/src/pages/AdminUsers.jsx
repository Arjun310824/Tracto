import { useState, useEffect } from "react";
import { FaUsers, FaBan, FaCheck, FaUserCircle, FaSearch } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_blocked: res.data.is_blocked } : u))
      );
    } catch (err) {
      console.error("Error blocking user:", err);
      alert("Failed to change user block status.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const nameMatch = `${u.first_name || ""} ${u.last_name || ""} ${u.email || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesRole && nameMatch;
  });

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
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h1 className="h3 fw-extrabold text-dark m-0 font-heading">User Directory & RBAC Control</h1>
                <p className="text-muted small m-0 mt-0.5">
                  Manage registered farmers, tractor owners, and system administrators
                </p>
              </div>

              <Badge variant="primary" size="md">
                {users.length} Total Registered Accounts
              </Badge>
            </div>

            {/* Filter Tabs and Search Bar */}
            <div className="bg-white rounded-4 border p-3 shadow-sm mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex gap-2 overflow-auto text-nowrap pb-1 pb-md-0">
                  {["all", "customer", "owner", "admin"].map((role) => (
                    <button
                      key={role}
                      className={`btn btn-sm rounded-pill text-capitalize px-3 py-1.5 fw-semibold transition-all ${
                        roleFilter === role
                          ? "btn-success text-white shadow-sm"
                          : "btn-outline-secondary bg-white text-secondary"
                      }`}
                      onClick={() => setRoleFilter(role)}
                    >
                      {role === "all" ? "All Users" : `${role}s`}
                      {role !== "all" && (
                        <span className="ms-1 opacity-75">
                          ({users.filter((u) => u.role === role).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="tracto-input-wrapper has-icon-left" style={{ maxWidth: 300 }}>
                  <span className="tracto-input-icon left">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="tracto-input"
                    style={{ minHeight: 38, fontSize: "0.875rem" }}
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="tracto-spinner" style={{ width: "3rem", height: "3rem", color: "var(--primary-600)" }} />
                <p className="text-muted small mt-3">Loading users directory...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 shadow-sm">
                <EmptyState
                  icon={<FaUsers />}
                  title="No Users Found"
                  description="No registered user profiles matched your role filter or search criteria."
                />
              </div>
            ) : (
              <div className="bg-white rounded-4 border p-4 shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>User Profile</th>
                        <th>Role</th>
                        <th>Mobile</th>
                        <th>Farm Location</th>
                        <th>Account Status</th>
                        <th className="text-end">Moderation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2.5">
                              <div
                                className="rounded-circle p-2 d-flex align-items-center justify-content-center text-secondary flex-shrink-0"
                                style={{ width: 38, height: 38, background: "var(--slate-100)" }}
                              >
                                <FaUserCircle className="fs-5" />
                              </div>
                              <div>
                                <div className="fw-bold text-dark font-heading">
                                  {u.first_name} {u.last_name}
                                </div>
                                <div className="text-muted small">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge
                              variant={u.role === "owner" ? "warning" : u.role === "admin" ? "danger" : "success"}
                              size="sm"
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="small text-muted font-monospace">{u.phone || "N/A"}</td>
                          <td className="small text-muted">{u.district ? `${u.district}, ${u.state || "GJ"}` : "Gujarat"}</td>
                          <td>
                            {u.is_blocked ? (
                              <Badge variant="danger" size="sm">Suspended</Badge>
                            ) : (
                              <Badge variant="success" size="sm" dot>Active</Badge>
                            )}
                          </td>
                          <td className="text-end">
                            <Button
                              variant={u.is_blocked ? "outline" : "danger"}
                              size="sm"
                              onClick={() => handleToggleBlock(u.id)}
                              icon={u.is_blocked ? <FaCheck /> : <FaBan />}
                            >
                              {u.is_blocked ? "Unblock Account" : "Block User"}
                            </Button>
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
