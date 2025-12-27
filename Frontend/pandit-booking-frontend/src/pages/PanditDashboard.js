import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  CalendarCheck2,
  Users,
  MessageCircle,
  IndianRupee,
  Phone,
  ShieldCheck,
  Timer,
  XCircle,
  ArrowRight,
  Clock3,
  LogOut,
  UserCircle2,
  MapPin,
  Lamp,
  Calendar,
  Clock,
  Gift,
  Zap,
  TrendingUp,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./PanditDashboard.css";

/* ChatWindow Modal */
const ChatWindow = ({ userId, panditId, chatName, onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <motion.div
      className="chat-window-modal"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="chat-window-content-wrapper"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="chat-window-header">
          <span>Chat with {chatName}</span>
          <button
            onClick={onClose}
            aria-label="Close chat window"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="chat-window-content">
          <p className="chat-feature-note">
            [Chat for panditId: {panditId}] - Feature Coming Soon
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* Header */
const DashboardHeader = ({ userName, userEmail }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <header className="dashboard-main-header">
      <div className="header-user-info">
        <span className="user-greeting">
          Namaste,{" "}
          <span className="user-name-header">{userName || "Pandit Ji"}</span>!
        </span>
        <span className="user-email-header">
          {userEmail || "pandit@example.com"}
        </span>
      </div>
      <div className="header-datetime-info">
        <span className="current-date">
          <Calendar
            size={18}
            style={{ marginRight: 5, verticalAlign: "middle" }}
          />{" "}
          {formattedDate}
        </span>
        <span className="current-time">
          <Clock
            size={18}
            style={{ marginRight: 5, verticalAlign: "middle" }}
          />{" "}
          {formattedTime}
        </span>
      </div>
      <div className="header-action-items">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={22} />
        </button>
        <button className="icon-button" aria-label="Settings">
          <UserCircle2 size={22} />
        </button>
      </div>
    </header>
  );
};

const pages = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  devotees: "Devotees",
  chat: "Chats",
};

function PanditDashboard() {
  const navigate = useNavigate();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user")) || {},
    []
  );
  const {
    _id,
    name,
    email,
    is_verified,
    city,
    experienceYears,
    phone,
    languages,
    speciality,
    profile_photo_url,
  } = user;

  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [filterDate, setFilterDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeChatDevoteeId, setActiveChatDevoteeId] = useState(null);
  const [activeChatDevoteeName, setActiveChatDevoteeName] = useState("");
  const [filterResetTrigger, setFilterResetTrigger] = useState(0);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingDevotees, setLoadingDevotees] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (_id) {
        setLoadingBookings(true);
        try {
          const res = await fetch(
            `http://localhost:5000/api/bookings/view?panditid=${_id}`
          );
          const data = await res.json();
          setBookings(data);
        } catch (error) {
          console.error("Failed to fetch bookings:", error);
          setBookings([]);
        } finally {
          setLoadingBookings(false);
        }
      } else {
        setBookings([]);
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [_id]);

  const completedCount = useMemo(
    () => bookings.filter((b) => b.status === "Accepted").length,
    [bookings]
  );
  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "Pending").length,
    [bookings]
  );
  const rejectedCount = useMemo(
    () => bookings.filter((b) => b.status === "Rejected").length,
    [bookings]
  );
  const totalBookingsCount = bookings.length;

  const uniqueDevoteesCount = useMemo(() => {
    const ids = new Set();
    bookings.forEach((b) => b.userid?._id && ids.add(b.userid._id));
    return ids.size;
  }, [bookings]);

  const totalEarnings = completedCount * 500;

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const dateMatch = filterDate ? b.puja_date === filterDate : true;
        const nameMatch = b.userid?.name
          ?.toLowerCase()
          .includes(searchName.toLowerCase());
        const statusMatch = filterStatus ? b.status === filterStatus : true;
        return dateMatch && nameMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings, filterDate, searchName, filterStatus, filterResetTrigger]);

  const devoteesList = useMemo(() => {
    setLoadingDevotees(true);
    const map = {};
    bookings.forEach((b) => {
      if (b.userid?._id && !map[b.userid._id]) {
        map[b.userid._id] = {
          id: b.userid._id,
          name: b.userid.name,
          phone: b.userid.phone,
          city: b.location,
        };
      }
    });
    setLoadingDevotees(false);
    return Object.values(map);
  }, [bookings]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/status/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.booking) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? data.booking : b))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const statusIcon = {
    Pending: <Timer size={18} color="#e5ae28" />,
    Accepted: <ShieldCheck size={18} color="#23cb7d" />,
    Rejected: <XCircle size={18} color="#e15d7c" />,
  };

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={24} /> },
    { key: "bookings", label: "Bookings", icon: <CalendarCheck2 size={24} /> },
    { key: "devotees", label: "Devotees", icon: <Users size={24} /> },
    { key: "chat", label: "Chats", icon: <MessageCircle size={24} /> },
  ];

  const topServices = useMemo(() => {
    const stats = {};
    bookings.forEach((b) => {
      const svc = b.serviceid?.name;
      if (svc) stats[svc] = (stats[svc] || 0) + 1;
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [bookings]);

  const upcoming = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          new Date(b.puja_date) >=
            new Date(Date.now() - 24 * 60 * 60 * 1000) &&
          b.status === "Accepted"
      )
      .sort((a, b) => new Date(a.puja_date) - new Date(b.puja_date))
      .slice(0, 5);
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [bookings]);

  const clearFilters = () => {
    setFilterDate("");
    setSearchName("");
    setFilterStatus("");
    setFilterResetTrigger((t) => t + 1);
  };

  const performanceMetrics = useMemo(() => {
    const acceptRate =
      totalBookingsCount > 0
        ? ((completedCount / totalBookingsCount) * 100).toFixed(1)
        : 0;
    const avgResponseTime = "2.5 hrs";
    return { acceptRate, avgResponseTime };
  }, [completedCount, totalBookingsCount]);

  const panditTips = [
    "Ensure prompt responses to pending bookings to improve your acceptance rate.",
    "Keep your profile updated with your latest services and availability.",
    "Engage with devotees via chat for better coordination and service.",
    "Collect feedback from devotees to enhance your reputation.",
  ];

  return (
    <div className="pdash-bg">
      <div className="pandit-main-layout">
        {/* Sidebar */}
        <aside
          className="pandit-sidebar"
          aria-label="Pandit dashboard navigation"
        >
          <div className="pandit-profile-sidebar">
            <img
              src="/images/subh.png"
              alt="App Logo"
              className="pandit-logo"
            />
            <div className="sidebar-verification-status" tabIndex={-1}>
              <small
                className={is_verified ? "text-verified" : "text-pending"}
              >
                {is_verified ? (
                  <>
                    <ShieldCheck size={14} /> Verified
                  </>
                ) : (
                  <>
                    <Timer size={14} /> Not Verified
                  </>
                )}
              </small>
            </div>
          </div>

          <nav role="navigation" aria-label="Main dashboard pages">
            <div className="sidebar-section-label">Navigation</div>
            {sidebarItems.map((item) => (
              <div
                key={item.key}
                className={`sidebar-navitem${
                  currentPage === item.key ? " active" : ""
                }`}
                onClick={() => setCurrentPage(item.key)}
                tabIndex={0}
                role="button"
                aria-current={currentPage === item.key ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setCurrentPage(item.key);
                }}
              >
                {item.icon}
                <span className="sidebar-item-label">{item.label}</span>
              </div>
            ))}
          </nav>

          <button
            className="logout-btn sidebar-logout-btn"
            onClick={handleLogout}
            aria-label="Logout from dashboard"
            type="button"
          >
            <LogOut size={22} /> Logout
          </button>
        </aside>

        {/* Main content */}
        <main
          className="pandit-content"
          aria-hidden={activeChatDevoteeId ? true : false}
        >
          <DashboardHeader userName={name} userEmail={email} />

          <header className="pandit-header-row2" aria-live="polite">
            <h1 className="pandit-heading">{pages[currentPage]}</h1>
          </header>

          {/* DASHBOARD PAGE */}
          {currentPage === "dashboard" && (
            <>
              {/* Hero panel */}
              <section
                className="pdash-hero-card animate-in"
                aria-label="Dashboard overview"
              >
                <div className="pdash-hero-left">
                  <div className="pdash-hero-breadcrumb">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="pdash-hero-crumb-active">Overview</span>
                  </div>

                  <span className="pdash-hero-badge">ShubhKarya Pandit</span>

                  <h2 className="pdash-hero-title">Service Overview</h2>
                  <p className="pdash-hero-text">
                    Real-time view of your devotees, puja bookings and
                    performance on ShubhKarya. Stay organised and prepared for
                    every ritual.
                  </p>
                </div>

                <div className="pdash-hero-stats">
                  <div className="pdash-hero-tile">
                    <div className="pdash-hero-tile-icon users">
                      <Users size={18} />
                    </div>
                    <p className="pdash-hero-tile-label">Total devotees</p>
                    <p className="pdash-hero-tile-value">
                      {uniqueDevoteesCount}
                    </p>
                  </div>

                  <div className="pdash-hero-tile">
                    <div className="pdash-hero-tile-icon verify">
                      <ShieldCheck size={18} />
                    </div>
                    <p className="pdash-hero-tile-label">Verification</p>
                    <p className="pdash-hero-tile-value">
                      {is_verified ? "Verified" : "Not verified"}
                    </p>
                  </div>

                  <div className="pdash-hero-tile">
                    <div className="pdash-hero-tile-icon bookings">
                      <CalendarCheck2 size={18} />
                    </div>
                    <p className="pdash-hero-tile-label">Total bookings</p>
                    <p className="pdash-hero-tile-value">
                      {bookings.length}
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick actions */}
              <section
                className="pdash-quick-actions"
                aria-label="Quick actions"
              >
                <div
                  className="pdash-quick-card"
                  onClick={() => setCurrentPage("bookings")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setCurrentPage("bookings");
                  }}
                >
                  <div className="pdash-quick-icon bookings">
                    <CalendarCheck2 size={20} />
                  </div>
                  <div className="pdash-quick-body">
                    <h3>View all bookings</h3>
                    <p>Manage upcoming and past pujas, accept or reject.</p>
                    <span className="pdash-quick-meta">
                      {bookings.length} total • {completedCount} completed
                    </span>
                  </div>
                  <ArrowRight size={18} className="pdash-quick-arrow" />
                </div>

                <div
                  className="pdash-quick-card"
                  onClick={() => setCurrentPage("devotees")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setCurrentPage("devotees");
                  }}
                >
                  <div className="pdash-quick-icon devotees">
                    <Users size={20} />
                  </div>
                  <div className="pdash-quick-body">
                    <h3>Your devotees</h3>
                    <p>See who has booked you and from which city.</p>
                    <span className="pdash-quick-meta">
                      {uniqueDevoteesCount} unique devotees
                    </span>
                  </div>
                  <ArrowRight size={18} className="pdash-quick-arrow" />
                </div>

                <div className="pdash-quick-card">
                  <div className="pdash-quick-icon earnings">
                    <IndianRupee size={20} />
                  </div>
                  <div className="pdash-quick-body">
                    <h3>Top pujas &amp; earnings</h3>
                    <p>Understand which rituals are requested the most.</p>
                    <span className="pdash-quick-meta">
                      Est. earnings ₹{totalEarnings}{" "}
                      {topServices.length > 0 &&
                        `• Top puja: ${topServices[0][0]}`}
                    </span>
                  </div>
                </div>
              </section>

              {/* Overview summary cards */}
              <section className="pandit-dashboard-cards">
                <div className="dash-card gradientblue">
                  <div className="dash-card-icon">
                    <CalendarCheck2 size={18} />
                  </div>
                  <div>
                    <span className="dash-card-label">Total bookings</span>
                    <span className="dash-card-value">
                      {totalBookingsCount}
                    </span>
                  </div>
                </div>

                <div className="dash-card gradientmint">
                  <div className="dash-card-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <span className="dash-card-label">Completed</span>
                    <span className="dash-card-value">{completedCount}</span>
                  </div>
                </div>

                <div className="dash-card gradientyellow">
                  <div className="dash-card-icon">
                    <Timer size={18} />
                  </div>
                  <div>
                    <span className="dash-card-label">Pending</span>
                    <span className="dash-card-value">{pendingCount}</span>
                  </div>
                </div>

                <div className="dash-card gradientpink">
                  <div className="dash-card-icon">
                    <XCircle size={18} />
                  </div>
                  <div>
                    <span className="dash-card-label">Rejected</span>
                    <span className="dash-card-value">{rejectedCount}</span>
                  </div>
                </div>
              </section>

              {/* Performance metrics */}
              <section className="performance-metrics">
                <h3>
                  <TrendingUp size={18} /> Service performance
                </h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Acceptance rate</span>
                    <span className="metric-value">
                      {performanceMetrics.acceptRate}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Avg. response time</span>
                    <span className="metric-value">
                      {performanceMetrics.avgResponseTime}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Total devotees</span>
                    <span className="metric-value">
                      {uniqueDevoteesCount}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Est. earnings</span>
                    <span className="metric-value">₹{totalEarnings}</span>
                  </div>
                </div>
              </section>

              {/* Widgets row */}
              <section className="dashboard-widgets">
                <div className="widget">
                  <h3>
                    <Clock3 size={18} /> Upcoming pujas
                  </h3>
                  <ul>
                    {upcoming.length === 0 ? (
                      <li>No upcoming accepted pujas.</li>
                    ) : (
                      upcoming.map((b) => (
                        <li key={b._id} className="activity-item">
                          <span>
                            {b.pujaId?.name || "Puja"} •{" "}
                            {new Date(b.puja_date).toLocaleDateString("en-IN")}{" "}
                            at {b.puja_time || "--"}
                          </span>
                          <span
                            className="date-tag"
                            style={{ background: "#22c55e" }}
                          >
                            Accepted
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="widget pandit-tips">
                  <h3>
                    <Zap size={18} /> Tips to grow
                  </h3>
                  <ul>
                    {panditTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* <div className="widget" style={{ gridColumn: "1 / -1" }}>
                  <h3>
                    <Gift size={18} /> Top pujas
                  </h3>
                  <ul>
                    {topServices.length === 0 ? (
                      <li>No puja stats available yet.</li>
                    ) : (
                      topServices.map(([svcName, cnt]) => (
                        <li key={svcName}>
                          <span>{svcName}</span>
                          <span className="status-text">
                            {cnt} bookings
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div> */}

                {/* <div className="widget" style={{ gridColumn: "1 / -1" }}>
                  <h3>
                    <Clock3 size={18} /> Recent activity
                  </h3>
                  <ul>
                    {recentBookings.length === 0 ? (
                      <li>No recent bookings yet.</li>
                    ) : (
                      recentBookings.map((b) => (
                        <li key={b._id} className="activity-item">
                          <span>
                            {b.userid?.name || "Devotee"} booked{" "}
                            {b.pujaId?.name || "Puja"}
                          </span>
                          <span className="date-tag" style={{ background: "#f97316" }}>
                            {new Date(b.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div> */}
              </section>
            </>
          )}

          {/* BOOKINGS PAGE */}
          {currentPage === "bookings" && (
            <>
              <motion.div
                className="pandit-filters animate-in"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <input
                  type="date"
                  value={filterDate}
                  className="pandit-input"
                  onChange={(e) => setFilterDate(e.target.value)}
                  aria-label="Filter bookings by date"
                />
                <input
                  type="text"
                  placeholder="Search by devotee name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pandit-input"
                  aria-label="Search bookings by devotee name"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pandit-select"
                  aria-label="Filter bookings by status"
                >
                  <option value="">All status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  className="clear-filters-btn"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                >
                  Clear filters
                </button>
              </motion.div>

              {loadingBookings ? (
                <p className="loading-message">Loading bookings…</p>
              ) : (
                <>
                  <p
                    className="pandit-count"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    Showing {filteredBookings.length} booking
                    {filteredBookings.length !== 1 ? "s" : ""}
                  </p>

                  <div
                    className="pandit-bookings-grid"
                    role="list"
                    aria-label="Filtered bookings list"
                  >
                    <AnimatePresence>
                      {filteredBookings.length ? (
                        filteredBookings.map((b, i) => (
                          <motion.div
                            key={b._id}
                            className={`pandit-booking-card ${b.status.toLowerCase()}`}
                            role="listitem"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ delay: 0.04 * i }}
                          >
                            <div className="pandit-booking-head">
                              <span className="booking-devotee">
                                {b.userid?.name || "Devotee"}
                              </span>
                              <span
                                className={`pandit-status ${b.status.toLowerCase()}`}
                              >
                                {statusIcon[b.status]} {b.status}
                              </span>
                            </div>

                            <div className="pandit-booking-row">
                              <span>
                                <Phone size={16} aria-hidden="true" />{" "}
                                {b.userid?.phone || "No phone"}
                              </span>
                            </div>

                            <div className="pandit-booking-row">
                              <span>
                                <Lamp size={16} aria-hidden="true" />{" "}
                                <b>Puja:</b> {b.pujaId?.name || "Not set"}
                              </span>
                              <span>
                                <Users size={16} aria-hidden="true" />{" "}
                                <b>Service:</b>{" "}
                                {b.serviceid?.name || "Not set"}
                              </span>
                            </div>

                            <div className="pandit-booking-row">
                              <span>
                                <Calendar size={16} aria-hidden="true" />{" "}
                                <b>Date:</b>{" "}
                                {new Date(b.puja_date).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                              <span>
                                <Clock size={16} aria-hidden="true" />{" "}
                                <b>Time:</b> {b.puja_time || "--"}
                              </span>
                            </div>

                            <div className="pandit-booking-row">
                              <span>
                                <MapPin size={16} aria-hidden="true" />{" "}
                                <b>Location:</b>{" "}
                                {b.location || "Not provided"}
                              </span>
                            </div>

                            {b.status === "Pending" && (
                              <div
                                className="pandit-buttons"
                                aria-label="Actions for pending booking"
                              >
                                <button
                                  type="button"
                                  className="accept-btn"
                                  onClick={() =>
                                    updateStatus(b._id, "Accepted")
                                  }
                                  aria-label={`Accept booking for ${
                                    b.userid?.name || "devotee"
                                  }`}
                                >
                                  <ShieldCheck size={16} /> Accept
                                </button>
                                <button
                                  type="button"
                                  className="reject-btn"
                                  onClick={() =>
                                    updateStatus(b._id, "Rejected")
                                  }
                                  aria-label={`Reject booking for ${
                                    b.userid?.name || "devotee"
                                  }`}
                                >
                                  <XCircle size={16} /> Reject
                                </button>
                              </div>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          key="no-bookings"
                          className="pandit-nobookings"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          No bookings match your filters.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </>
          )}

          {/* DEVOTEES PAGE */}
          {currentPage === "devotees" && (
            <>
              <section
                className="pandit-devotee-list fade-in"
                aria-label="Devotees you have served"
              >
                <h2 className="devotee-list-title">
                  <Users size={20} aria-hidden="true" /> Your devotees
                </h2>

                {loadingDevotees ? (
                  <p className="loading-message">Loading devotees…</p>
                ) : devoteesList.length === 0 ? (
                  <p className="empty-state-message">
                    No devotees yet. Accepted bookings will appear here as
                    devotees.
                  </p>
                ) : (
                  <div
                    className="devotees-table"
                    role="table"
                    aria-label="Devotees list"
                  >
                    <div className="devotees-table-header" role="row">
                      <div role="columnheader">Name</div>
                      <div role="columnheader">Phone</div>
                      <div role="columnheader">City / Area</div>
                      <div role="columnheader">Chat</div>
                    </div>

                    {devoteesList.map((d) => (
                      <div
                        key={d.id}
                        className="devotees-table-row"
                        role="row"
                      >
                        <div role="cell">{d.name || "Devotee"}</div>
                        <div role="cell">{d.phone || "Not provided"}</div>
                        <div role="cell">{d.city || "—"}</div>
                        <div role="cell">
                          <button
                            type="button"
                            className="chat-devotee-btn"
                            onClick={() => {
                              setActiveChatDevoteeId(d.id);
                              setActiveChatDevoteeName(d.name || "Devotee");
                            }}
                            aria-label={`Chat with devotee ${
                              d.name || "Devotee"
                            }`}
                            disabled={!d.id}
                          >
                            <MessageCircle
                              size={15}
                              aria-hidden="true"
                            />{" "}
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="pandit-chat-guide">
                <p>
                  Tip: Keep your devotee details updated by confirming phone and
                  city during each puja.
                </p>
                <p>This helps you understand where most of your requests come.</p>
              </div>
            </>
          )}

          {/* CHAT PAGE */}
          {currentPage === "chat" && (
            <>
              <section
                className="pandit-devotee-list fade-in"
                aria-label="Chat with devotees"
              >
                <h2 className="devotee-list-title">
                  <MessageCircle size={20} aria-hidden="true" /> Chats
                </h2>

                <p className="empty-state-message">
                  Chat will allow you to coordinate puja details, timings, and
                  samagri directly with devotees. For now, you can open a chat
                  from any devotee row.
                </p>

                {devoteesList && devoteesList.length > 0 && (
                  <div
                    className="devotees-table"
                    role="table"
                    aria-label="Recent chat contacts"
                    style={{ marginTop: "18px" }}
                  >
                    <div className="devotees-table-header" role="row">
                      <div role="columnheader">Devotee</div>
                      <div role="columnheader">Phone</div>
                      <div role="columnheader">Last city / area</div>
                      <div role="columnheader">Chat</div>
                    </div>

                    {devoteesList.slice(0, 6).map((d) => (
                      <div
                        key={d.id}
                        className="devotees-table-row"
                        role="row"
                      >
                        <div role="cell">{d.name || "Devotee"}</div>
                        <div role="cell">{d.phone || "Not provided"}</div>
                        <div role="cell">{d.city || "—"}</div>
                        <div role="cell">
                          <button
                            type="button"
                            className="chat-devotee-btn"
                            onClick={() => {
                              setActiveChatDevoteeId(d.id);
                              setActiveChatDevoteeName(d.name || "Devotee");
                            }}
                            aria-label={`Chat with devotee ${
                              d.name || "Devotee"
                            }`}
                            disabled={!d.id}
                          >
                            <MessageCircle
                              size={15}
                              aria-hidden="true"
                            />{" "}
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="pandit-chat-guide">
                <p>
                  Use chats to confirm addresses, samagri and special
                  instructions.
                </p>
                <p>You can start a chat from Devotees at any time.</p>
              </div>

              <AnimatePresence>
                {activeChatDevoteeId && (
                  <ChatWindow
                    userId={_id}
                    panditId={_id}
                    chatName={activeChatDevoteeName}
                    onClose={() => {
                      setActiveChatDevoteeId(null);
                      setActiveChatDevoteeName("");
                    }}
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default PanditDashboard;
