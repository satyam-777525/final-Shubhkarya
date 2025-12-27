// src/pages/BookingHistory.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { getBookings } from "../api/api";
import "./BookingHistory.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Helper to get week string: YYYY-WW
function getWeekString(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const jan4 = new Date(target.getFullYear(), 0, 4);
  const dayDiff = (target - jan4) / 86400000;
  const weekNum = 1 + Math.floor(dayDiff / 7);

  return `${year}-W${weekNum.toString().padStart(2, "0")}`;
}

// Helper to get month string: YYYY-MM
function getMonthString(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", date: "" });
  const [timeGroup, setTimeGroup] = useState("month"); // week or month

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const res = await getBookings();
        setBookings(res.data || []);
      } catch (error) {
        console.error("Error fetching bookings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  function normalizeStatus(status) {
    if (!status) return "unknown";
    if (status.toLowerCase() === "accepted") return "confirmed";
    return status.toLowerCase();
  }

  function getBookingDate(b) {
    return b.puja_date || b.date;
  }

  const filteredBookings = useMemo(
    () =>
      bookings.filter((b) => {
        if (
          filter.status !== "all" &&
          b.status?.toLowerCase() !== filter.status
        )
          return false;
        if (filter.date) {
          const bookingDate = getBookingDate(b);
          if (!bookingDate || !bookingDate.startsWith(filter.date)) return false;
        }
        return true;
      }),
    [bookings, filter]
  );

  const statusCounts = filteredBookings.reduce((acc, b) => {
    const s = normalizeStatus(b.status);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const timeCountsMap = {};
  bookings.forEach((b) => {
    if (filter.status !== "all" && b.status?.toLowerCase() !== filter.status)
      return;
    const bookingDate = getBookingDate(b);
    if (!bookingDate) return;
    const key =
      timeGroup === "week" ? getWeekString(bookingDate) : getMonthString(bookingDate);
    timeCountsMap[key] = (timeCountsMap[key] || 0) + 1;
  });

  const sortedKeys = Object.keys(timeCountsMap).sort();

  const barColors = sortedKeys.map((_, idx) =>
    idx % 3 === 0
      ? "rgba(249, 115, 22, 0.90)"
      : idx % 3 === 1
      ? "rgba(251, 146, 60, 0.85)"
      : "rgba(253, 186, 116, 0.85)"
  );

  const data = {
    labels: sortedKeys,
    datasets: [
      {
        label: `Bookings per ${timeGroup === "week" ? "Week" : "Month"}`,
        data: sortedKeys.map((k) => timeCountsMap[k]),
        backgroundColor: barColors,
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const total = bookings.length;
  const totalFiltered = filteredBookings.length;

  return (
    <div className="booking-history-page">
      {/* Breadcrumb */}
      <div className="booking-topbar">
        <span className="crumb-main">Admin</span>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">Booking History</span>
      </div>

      {/* Header */}
      <header className="booking-header">
        <div className="booking-title-block">
          <div className="booking-title-row">
            <div className="booking-title-icon">📊</div>
            <div>
              <h2>Booking History</h2>
              <p className="booking-subtitle">
                Analyse puja bookings over time and monitor status trends.
              </p>
            </div>
          </div>
          <span className="booking-badge">Analytics · Overview</span>
        </div>

        <div className="booking-header-card">
          <div className="booking-stats">
            <div className="stat-chip">
              <span className="stat-label">Total bookings</span>
              <strong className="stat-value">{total}</strong>
            </div>
            <div className="stat-chip stat-chip--primary">
              <span className="stat-label">Visible (filtered)</span>
              <strong className="stat-value">{totalFiltered}</strong>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Completed</span>
              <strong className="stat-value">
                {statusCounts.completed || 0}
              </strong>
            </div>
          </div>
          <div className="booking-header-note">
            Use filters and grouping to explore booking volume by month or week.
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-title">Filters</div>
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="status-select">Status</label>
            <select
              id="status-select"
              value={filter.status}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Date</label>
            <input
              id="date-filter"
              type="date"
              value={filter.date}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="time-group">Group by</label>
            <select
              id="time-group"
              value={timeGroup}
              onChange={(e) => setTimeGroup(e.target.value)}
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>
        </div>
      </section>

      {/* Chart card */}
      <section className="chart-section">
        <div className="chart-section-header">
          <h3>Bookings over time</h3>
          <span className="chart-section-sub">
            Grouped by {timeGroup === "week" ? "week" : "month"}
            {filter.status !== "all" && ` · status: ${filter.status}`}
            {filter.date && ` · from: ${filter.date}`}
          </span>
        </div>
        <div className="chart-container">
          {loading ? (
            <p className="chart-loading">Loading...</p>
          ) : sortedKeys.length === 0 ? (
            <p className="chart-loading">No data for selected filters.</p>
          ) : (
            <Bar
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(15,23,42,0.95)",
                    titleColor: "#f9fafb",
                    bodyColor: "#e5e7eb",
                    borderColor: "rgba(249,115,22,0.6)",
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    callbacks: {
                      title: (items) =>
                        `${timeGroup === "week" ? "Week" : "Month"}: ${
                          items[0].label
                        }`,
                      label: (ctx) => `Bookings: ${ctx.parsed.y}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: "#6b7280",
                      maxRotation: 45,
                      minRotation: 0,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    precision: 0,
                    grid: {
                      color: "rgba(148,163,184,0.2)",
                    },
                    ticks: {
                      color: "#6b7280",
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </section>

      {/* Table card */}
      <section className="history-table-section">
        <div className="history-table-container">
          <div className="history-table-header-row">
            <h3>Bookings list</h3>
            <span className="history-table-count">
              Showing {totalFiltered} rows
            </span>
          </div>
          <table className="history-table" aria-label="Bookings table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pandit</th>
                <th>Devotee</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "#9ca3af",
                      padding: "1rem",
                    }}
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b._id}</td>
                    <td>{b.panditid?.name || "Unknown"}</td>
                    <td>{b.userid?.name || "Unknown"}</td>
                    <td>
                      {getBookingDate(b)
                        ? new Date(getBookingDate(b)).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-label status-${normalizeStatus(
                          b.status
                        )}`}
                      >
                        {b.status
                          ? b.status.charAt(0).toUpperCase() +
                            b.status.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default BookingHistory;
