import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5001/api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
      } else {
        setLoginError(
          data.message || "Login failed. Check your details and try again.",
        );
      }
    } catch (error) {
      console.error(error);
      setLoginError(
        "Cannot connect to GramFix server. Please try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
    setEmail("");
    setPassword("");
  };

  if (user && token) {
    if (user.role === "worker") {
      return (
        <WorkerDashboard user={user} token={token} onLogout={handleLogout} />
      );
    }

    if (user.role === "admin") {
      return (
        <AdminDashboard user={user} token={token} onLogout={handleLogout} />
      );
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-brand-section">
          <div className="brand-icon">🏘️</div>

          <h1>
            Gram<span>Fix</span>
          </h1>

          <p>
            Building better communities,
            <br />
            one report at a time.
          </p>

          <div className="login-features">
            <div>
              <span>✓</span>
              Report local problems
            </div>

            <div>
              <span>✓</span>
              Track issue progress
            </div>

            <div>
              <span>✓</span>
              Connect with your community
            </div>
          </div>
        </div>

        <div className="login-card-modern">
          <div className="login-heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h2>Sign in to GramFix</h2>
            <p>Access your community dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-email">Email address</label>

              <div className="input-wrapper">
                <span>✉</span>

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError("");
                  }}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {loginError && (
              <p className="login-error" role="alert">
                {loginError}
              </p>
            )}

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="demo-section">
            <div className="divider">
              <span>DEMO ACCESS</span>
            </div>

            <div className="demo-buttons">
              <button
                onClick={() => {
                  setEmail("ritik@example.com");
                  setPassword("Test@12345");
                  setLoginError("");
                }}
              >
                <span>👨‍💼</span>
                Admin
              </button>

              <button
                onClick={() => {
                  setEmail("rahul@gramfix.com");
                  setPassword("Worker@123");
                  setLoginError("");
                }}
              >
                <span>🧑‍🔧</span>
                Worker
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="login-footer">
        © 2026 GramFix · Community Infrastructure Platform
      </div>
    </div>
  );
}

/* =====================================================
   WORKER DASHBOARD
===================================================== */

function WorkerDashboard({ user, token, onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/worker/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        alert(data.message || "Failed to load assignments");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to GramFix server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const updateStatus = async (assignmentId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/worker/assignments/${assignmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        fetchAssignments();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to GramFix server.");
    }
  };

  const assignedCount = assignments.filter(
    (item) => item.status === "assigned",
  ).length;

  const progressCount = assignments.filter(
    (item) => item.status === "in_progress",
  ).length;

  const resolvedCount = assignments.filter(
    (item) => item.status === "resolved",
  ).length;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏘️</div>

          <div>
            <h2>
              Gram<span>Fix</span>
            </h2>
            <small>Community Platform</small>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>

          <div>
            <strong>{user.name}</strong>
            <small>Field Worker</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeMenu === "Dashboard" ? "active" : ""}
            onClick={() => setActiveMenu("Dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={activeMenu === "Reports" ? "active" : ""}
            onClick={() => setActiveMenu("Reports")}
          >
            <span>▤</span>
            My Reports
            <b>{assignments.length}</b>
          </button>

          <button
            className={activeMenu === "Locations" ? "active" : ""}
            onClick={() => setActiveMenu("Locations")}
          >
            <span>⌖</span>
            Locations
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button>
            <span>⚙</span>
            Settings
          </button>

          <button onClick={onLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="topbar-label">WORKER PORTAL</p>

            <h1>Good morning, {user.name?.split(" ")[0]} 👋</h1>
          </div>

          <div className="topbar-actions">
            <button className="notification-button">
              🔔
              <span></span>
            </button>

            <div className="topbar-profile">
              <div className="avatar small">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.name}</strong>
                <small>Worker</small>
              </div>
            </div>
          </div>
        </header>

        {/* STATISTICS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>

            <div>
              <p>Total Assigned</p>
              <h2>{assignments.length}</h2>
            </div>

            <span className="stat-decoration">01</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⏳</div>

            <div>
              <p>Pending</p>
              <h2>{assignedCount}</h2>
            </div>

            <span className="stat-decoration">02</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">⚙</div>

            <div>
              <p>In Progress</p>
              <h2>{progressCount}</h2>
            </div>

            <span className="stat-decoration">03</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <p>Resolved</p>
              <h2>{resolvedCount}</h2>
            </div>

            <span className="stat-decoration">04</span>
          </div>
        </section>

        {/* REPORT SECTION */}

        <section className="content-section">
          <div className="section-heading">
            <div>
              <p className="section-label">WORK MANAGEMENT</p>
              <h2>My Assigned Reports</h2>
            </div>

            <button className="refresh-button" onClick={fetchAssignments}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading your assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">
              <div>📭</div>
              <h3>No assignments yet</h3>
              <p>New reports assigned to you will appear here.</p>
            </div>
          ) : (
            <div className="reports-list">
              {assignments.map((assignment) => (
                <div
                  className="modern-report-card"
                  key={assignment.assignment_id}
                >
                  <div className="report-card-header">
                    <div className="report-title-area">
                      <div className="category-icon">
                        {assignment.category === "Road"
                          ? "🛣️"
                          : assignment.category === "Water"
                            ? "💧"
                            : "🏛️"}
                      </div>

                      <div>
                        <span className="category-name">
                          {assignment.category}
                        </span>

                        <h3>{assignment.title}</h3>
                      </div>
                    </div>

                    <span className={`status-badge ${assignment.status}`}>
                      <span></span>
                      {assignment.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="report-description">{assignment.description}</p>

                  <div className="report-meta">
                    <div>
                      <span>PRIORITY</span>
                      <strong className={`priority ${assignment.priority}`}>
                        ● {assignment.priority}
                      </strong>
                    </div>

                    <div>
                      <span>CITIZEN</span>
                      <strong>👤 {assignment.citizen_name}</strong>
                    </div>

                    <div>
                      <span>LOCATION</span>
                      <strong>
                        📍 {assignment.latitude}, {assignment.longitude}
                      </strong>
                    </div>
                  </div>

                  <div className="report-card-footer">
                    <small>
                      Assigned{" "}
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </small>

                    <div className="report-actions">
                      {assignment.status !== "resolved" && (
                        <button
                          className="action-secondary"
                          onClick={() =>
                            updateStatus(
                              assignment.assignment_id,
                              "in_progress",
                            )
                          }
                          disabled={assignment.status === "in_progress"}
                        >
                          {assignment.status === "in_progress"
                            ? "Work in Progress"
                            : "Start Work"}
                        </button>
                      )}

                      {assignment.status !== "resolved" && (
                        <button
                          className="action-primary"
                          onClick={() =>
                            updateStatus(assignment.assignment_id, "resolved")
                          }
                        >
                          ✓ Mark Resolved
                        </button>
                      )}

                      {assignment.status === "resolved" && (
                        <span className="resolved-label">✓ Issue Resolved</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

function AdminDashboard({ user, token, onLogout }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.reports || []);
      } else {
        alert(data.message || "Failed to load reports");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to GramFix server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏘️</div>

          <div>
            <h2>
              Gram<span>Fix</span>
            </h2>
            <small>Community Platform</small>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>

          <div>
            <strong>{user.name}</strong>
            <small>Administrator</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="active">
            <span>▦</span>
            Dashboard
          </button>

          <button>
            <span>▤</span>
            All Reports
            <b>{reports.length}</b>
          </button>

          <button>
            <span>👥</span>
            Workers
          </button>

          <button>
            <span>📊</span>
            Analytics
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button>
            <span>⚙</span>
            Settings
          </button>

          <button onClick={onLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="topbar-label">ADMIN PORTAL</p>

            <h1>Welcome back, {user.name?.split(" ")[0]} 👋</h1>
          </div>

          <div className="topbar-profile">
            <div className="avatar small">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div>
              <p>Total Reports</p>
              <h2>{reports.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⏳</div>
            <div>
              <p>Submitted</p>
              <h2>{reports.filter((r) => r.status === "submitted").length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">⚙</div>
            <div>
              <p>In Progress</p>
              <h2>
                {reports.filter((r) => r.status === "in_progress").length}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <p>Resolved</p>
              <h2>{reports.filter((r) => r.status === "resolved").length}</h2>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <p className="section-label">COMMUNITY MANAGEMENT</p>
              <h2>All Reports</h2>
            </div>

            <button className="refresh-button" onClick={fetchReports}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading reports...</p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div className="modern-report-card" key={report.id}>
                  <div className="report-card-header">
                    <div className="report-title-area">
                      <div className="category-icon">📋</div>

                      <div>
                        <span className="category-name">{report.category}</span>

                        <h3>{report.title}</h3>
                      </div>
                    </div>

                    <span className={`status-badge ${report.status}`}>
                      <span></span>
                      {report.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="report-description">{report.description}</p>

                  <div className="report-meta">
                    <div>
                      <span>PRIORITY</span>
                      <strong className={`priority ${report.priority}`}>
                        ● {report.priority}
                      </strong>
                    </div>

                    <div>
                      <span>CITIZEN</span>
                      <strong>👤 {report.citizen_name}</strong>
                    </div>

                    <div>
                      <span>LOCATION</span>
                      <strong>
                        📍 {report.latitude}, {report.longitude}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
