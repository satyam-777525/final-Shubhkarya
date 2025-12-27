import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDevotees, getAllPandits, getBookings } from "../api/api";
import "./Home1.css";

function Home1() {
  const [stats, setStats] = useState({ devotees: 0, pandits: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        const [devoteesRes, panditsRes, bookingsRes] = await Promise.all([
          getAllDevotees(),
          getAllPandits(),
          getBookings(),
        ]);
        setStats({
          devotees: devoteesRes.data?.length || 0,
          pandits: panditsRes.data?.length || 0,
          bookings: bookingsRes.data?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching counts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const sections = [
    {
      title: "Pandits Management",
      subtitle: "View, verify and maintain pandits directory",
      icon: "🕉️",
      to: "/admin/pandits",
      count: stats.pandits,
    },
    {
      title: "Devotees Directory",
      subtitle: "Manage user profiles and contact details",
      icon: "🙏",
      to: "/admin/devotees",
      count: stats.devotees,
    },
    {
      title: "Booking History",
      subtitle: "Complete overview with analytics and trends",
      icon: "📊",
      to: "/admin/bookings",
      count: stats.bookings,
    },
    {
      title: "Pooja Catalog",
      subtitle: "Manage all puja services and offerings",
      icon: "🪔",
      to: "/admin/poojas",
      count: 0,
    },
  ];

  const insights = [
    {
      title: "Platform Growth",
      value: "+24%",
      trend: "↗️ Monthly",
      color: "success",
    },
    {
      title: "Active Bookings",
      value: stats.bookings,
      trend: "Live",
      color: "primary",
    },
    {
      title: "Verified Pandits",
      value: stats.pandits,
      trend: "✅ All verified",
      color: "warning",
    },
  ];

  return (
    <div className="dashboard-home">
      {/* Hero */}
      <header className="dashboard-hero">
        <div className="hero-topbar">
          <span className="crumb-main">Dashboard</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-current">Overview</span>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">Shubhkarya Admin</div>
            <h1 className="hero-title">
              Platform <span className="hero-highlight">Overview</span>
            </h1>
            <p className="hero-subtitle">
              Real-time insights, analytics and complete control over your puja
              booking platform
            </p>
          </div>

          {/* Stats peach box */}
          <div className="hero-stats-wrapper">
            <div className="hero-stats">
              <div className="stat-card hero-stat">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.devotees}</div>
                  <div className="stat-label">Total Devotees</div>
                </div>
              </div>

              <div className="stat-card hero-stat">
                <div className="stat-icon">🕉️</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.pandits}</div>
                  <div className="stat-label">Verified Pandits</div>
                </div>
              </div>

              <div className="stat-card hero-stat">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.bookings}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content inside dashboard-main from layout */}
      <main className="dashboard-main-inner">
        {/* Quick Actions */}
        <section className="actions-section">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
            <p className="section-subtitle">
              {/* Navigate to your most used sections */}
            </p>
          </div>

          <div className="actions-grid">
            {sections.map((section) => (
              <div
                key={section.to}
                className="action-card"
                onClick={() => navigate(section.to)}
              >
                <div className="action-icon-large">{section.icon}</div>
                <div className="action-details">
                  <h3>{section.title}</h3>
                  <p>{section.subtitle}</p>
                  {section.count > 0 && (
                    <div className="action-count">
                      {section.count.toLocaleString()} items
                    </div>
                  )}
                </div>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </section>

        {/* Insights */}
        <section className="insights-section">
          <div className="section-header">
            <h2 className="section-title">Live Insights</h2>
            <p className="section-subtitle">
              {/* Platform performance at a glance */}
            </p>
          </div>

          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.color}`}>
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <div className="insight-title">{insight.title}</div>
                  <div className="insight-value">{insight.value}</div>
                  <div className="insight-trend">{insight.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <p className="section-subtitle">
              {/* Latest updates and notifications */}
            </p>
          </div>

          <div className="activity-grid">
            <div className="activity-card">
              <div className="activity-icon booking">📋</div>
              <div className="activity-content">
                <div className="activity-title">New booking received</div>
                <div className="activity-time">2 minutes ago</div>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon pandit">🕉️</div>
              <div className="activity-content">
                <div className="activity-title">Pandit verification pending</div>
                <div className="activity-time">1 hour ago</div>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon user">🙏</div>
              <div className="activity-content">
                <div className="activity-title">New devotee registered</div>
                <div className="activity-time">3 hours ago</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Loading dashboard...</p>
        </div>
      )}
    </div>
  );
}

export default Home1;
