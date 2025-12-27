// src/pages/DevoteesPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getAllDevotees } from "../api/api";
import "./DevoteesPage.css";

function DevoteesPage() {
  const [devotees, setDevotees] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // kept in case you want expand later
  const [editForm, setEditForm] = useState({});
  const [filters, setFilters] = useState({ name: "", city: "" });

  useEffect(() => {
    fetchDevotees();
  }, []);

  async function fetchDevotees() {
    try {
      const res = await getAllDevotees();
      setDevotees(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  function handleChange(id, field, value) {
    setEditForm((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  }

  async function handleSave(id) {
    try {
      const { name, email, ...rest } = editForm[id];
      await fetch(`https://localhost:5000/api/users/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      setExpandedId(null);
      fetchDevotees();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = useMemo(
  () =>
    devotees.filter((d) => {
      const name = d.name || "";           // fallback to empty string
      const city = d.city || "";

      if (
        filters.name &&
        !name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;

      if (
        filters.city &&
        !city.toLowerCase().includes(filters.city.toLowerCase())
      )
        return false;

      return true;
    }),
  [devotees, filters]
);

  const total = devotees.length;
  const withCity = devotees.filter((d) => d.city).length;

  return (
    <div className="devotees-page">
      {/* Breadcrumb */}
      <div className="devotees-topbar">
        <span className="crumb-main">Admin</span>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">Devotees</span>
      </div>

      {/* Header */}
      <header className="devotees-header">
        <div className="devotees-title-block">
          <div className="devotees-title-row">
            <div className="devotees-title-icon">🙏</div>
            <div>
              <h2>Devotees Directory</h2>
              <p className="devotees-subtitle">
                View and manage registered devotees and their contact details.
              </p>
            </div>
          </div>
          <span className="devotees-badge">User base · Live</span>
        </div>

        <div className="devotees-header-card">
          <div className="devotees-stats">
            <div className="stat-chip">
              <span className="stat-label">Total devotees</span>
              <strong className="stat-value">{total}</strong>
            </div>
            <div className="stat-chip stat-chip--success">
              <span className="stat-label">With city</span>
              <strong className="stat-value">{withCity}</strong>
            </div>
          </div>
          <div className="devotees-header-note">
            Use filters below to quickly search devotees by name or city.
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-title">Filters</div>
        <div className="devotees-filters">
          <input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) =>
              setFilters((f) => ({ ...f, name: e.target.value }))
            }
            aria-label="Filter devotees by name"
          />
          <input
            placeholder="Filter by city"
            value={filters.city}
            onChange={(e) =>
              setFilters((f) => ({ ...f, city: e.target.value }))
            }
            aria-label="Filter devotees by city"
          />
          <button
            type="button"
            onClick={() => setFilters({ name: "", city: "" })}
            aria-label="Clear filters"
          >
            Clear
          </button>
        </div>
      </section>

      {/* List */}
      <section className="devotees-cards-section">
        {filtered.length === 0 ? (
          <div className="devotees-empty">
            <p>No devotees found for the current filters.</p>
            <button
              type="button"
              onClick={() => setFilters({ name: "", city: "" })}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="devotees-cards-grid">
            {filtered.map((d) => {
              const form = editForm[d._id] || d;
              const isExpanded = expandedId === d._id;

              return (
                <article key={d._id} className="devotee-card">
                  <div className="devotee-card-layout">
                    {/* LEFT: basic info */}
                    <div className="devotee-card-left">
                      <div className="devotee-avatar">
                        {d.name?.[0]?.toUpperCase() || "D"}
                      </div>
                      <div className="devotee-main-info">
                        <h3 className="devotee-name">{d.name}</h3>
                        <p className="devotee-meta">
                          {d.email || "No email"}{" "}
                          {d.city ? `· ${d.city}` : ""}
                        </p>
                        {d.phone && (
                          <p className="devotee-meta">📞 {d.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: editable details */}
                    <div className="devotee-card-right">
                      <div className="devotee-fields">
                        <div className="devotee-field">
                          <label>Name</label>
                          <input value={form.name || ""} disabled />
                        </div>
                        <div className="devotee-field">
                          <label>Email</label>
                          <input value={form.email || ""} disabled />
                        </div>
                        <div className="devotee-field">
                          <label>Phone</label>
                          <input
                            value={form.phone || ""}
                            onChange={(e) =>
                              handleChange(d._id, "phone", e.target.value)
                            }
                          />
                        </div>
                        <div className="devotee-field">
                          <label>City</label>
                          <input
                            value={form.city || ""}
                            onChange={(e) =>
                              handleChange(d._id, "city", e.target.value)
                            }
                          />
                        </div>
                        <div className="devotee-field">
                          <label>Address</label>
                          <input
                            value={form.address || ""}
                            onChange={(e) =>
                              handleChange(d._id, "address", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="devotee-actions">
                        <button
                          type="button"
                          onClick={() => handleSave(d._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedId(null);
                            setEditForm((prev) => ({
                              ...prev,
                              [d._id]: d,
                            }));
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default DevoteesPage;
