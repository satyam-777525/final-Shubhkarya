// src/pages/PanditsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  getAllPandits,
  verifyPandit,
  uploadPanditPhoto,
  deletePandit,
} from "../api/api";
import "./PanditsPage.css";

function PanditsPage() {
  const [pandits, setPandits] = useState([]);
  const [panditImg, setPanditImg] = useState({});
  const [imgPreview, setImgPreview] = useState({});
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    experience: "",
  });

  useEffect(() => {
    fetchPandits();
  }, []);

  async function fetchPandits() {
    try {
      const res = await getAllPandits();
      setPandits(res.data || []);
    } catch (err) {
      console.error("Error fetching pandits", err);
    }
  }

  const filtered = useMemo(
    () =>
      pandits.filter((p) => {
        if (
          filters.name &&
          !p.name.toLowerCase().includes(filters.name.toLowerCase())
        )
          return false;
        if (
          filters.city &&
          !(p.city && p.city.toLowerCase().includes(filters.city.toLowerCase()))
        )
          return false;
        if (
          filters.experience &&
          String(p.experienceYears) !== filters.experience
        )
          return false;
        return true;
      }),
    [pandits, filters]
  );

  const total = pandits.length;
  const verified = pandits.filter((p) => p.is_verified).length;
  const pending = total - verified;

  function getPanditImage(pandit) {
    if (imgPreview[pandit._id]) return imgPreview[pandit._id];
    if (pandit.profile_photo_url)
      return pandit.profile_photo_url.startsWith("/uploads")
        ? `https://backendserver-lnxc.onrender.com${pandit.profile_photo_url}`
        : pandit.profile_photo_url;
    return "/images/default-pandit.png";
  }

  return (
    <div className="pandits-page">
      {/* Top breadcrumb bar */}
      <div className="pandits-topbar">
        <span className="crumb-main">Admin</span>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">Pandits</span>
      </div>

      {/* Header + stats */}
      <header className="pandits-header">
        <div className="pandits-title-block">
          <div className="pandits-title-row">
            <div className="pandits-title-icon">🕉️</div>
            <div>
              <h2>Pandits Management</h2>
              <p className="pandits-subtitle">
                Manage Shubhkarya&apos;s trusted pandits, verification status
                and profiles in one place.
              </p>
            </div>
          </div>
          <span className="pandits-badge">Directory · Live</span>
        </div>

        <div className="pandits-header-card">
          <div className="pandits-stats">
            <div className="stat-chip">
              <span className="stat-label">Total pandits</span>
              <strong className="stat-value">{total}</strong>
            </div>
            <div className="stat-chip stat-chip--success">
              <span className="stat-label">Verified</span>
              <strong className="stat-value">{verified}</strong>
            </div>
            <div className="stat-chip stat-chip--warning">
              <span className="stat-label">Pending</span>
              <strong className="stat-value">{pending}</strong>
            </div>
          </div>

          <div className="pandits-header-note">
            Use filters below to quickly narrow down pandits by name, city or
            experience.
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-title">Filters</div>
        <div className="pandit-filters">
          <input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) =>
              setFilters((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            placeholder="City"
            value={filters.city}
            onChange={(e) =>
              setFilters((f) => ({ ...f, city: e.target.value }))
            }
          />
          <input
            placeholder="Exp. years"
            type="number"
            min="0"
            value={filters.experience}
            onChange={(e) =>
              setFilters((f) => ({ ...f, experience: e.target.value }))
            }
          />
          <button
            type="button"
            onClick={() =>
              setFilters({ name: "", city: "", experience: "" })
            }
          >
            Clear
          </button>
        </div>
      </section>

      {/* Pandits list */}
      <section className="pandit-cards-section">
        {filtered.length === 0 ? (
          <div className="pandits-empty">
            <p>No pandits match the current filters.</p>
            <button
              type="button"
              onClick={() =>
                setFilters({ name: "", city: "", experience: "" })
              }
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="pandit-cards-grid">
            {filtered.map((p) => (
              <article key={p._id} className="pandit-card">
                <div className="pandit-card-layout">
                  {/* LEFT: avatar + main info */}
                  <div className="pandit-card-left">
                    <img
                      src={getPanditImage(p)}
                      alt={p.name}
                      className="pandit-photo"
                    />
                    <div className="pandit-main-info">
                      <h3 className="pandit-name">{p.name}</h3>
                      <p className="pandit-city-line">
                        {p.city || "Unknown city"} · {p.experienceYears || 0}{" "}
                        yrs exp.
                      </p>
                      <p className="pandit-languages">
                        {Array.isArray(p.languages)
                          ? p.languages.join(", ")
                          : p.languages}
                      </p>
                      <div className="pandit-status-row">
                        {p.is_verified ? (
                          <span className="pandit-status-verified">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="pandit-status-unverified">
                            ⏳ Not verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: details, actions, upload */}
                  <div className="pandit-card-right">
                    <div className="pandit-details">
                      <p>
                        <strong>Email:</strong> {p.email}
                      </p>
                      <p>
                        <strong>Specialties:</strong>{" "}
                        {Array.isArray(p.specialties)
                          ? p.specialties.join(", ")
                          : p.specialties}
                      </p>
                      <p className="pandit-bio">
                        <strong>Bio:</strong> {p.bio}
                      </p>
                    </div>

                    <div className="pandit-actions">
                      {!p.is_verified && (
                        <button
                          type="button"
                          className="btn-verify"
                          onClick={() => verifyPandit(p._id).then(fetchPandits)}
                        >
                          Verify
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => {
                          if (window.confirm("Are you sure?")) {
                            deletePandit(p._id).then(fetchPandits);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="upload-photo">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setPanditImg((prev) => ({ ...prev, [p._id]: file }));
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setImgPreview((prev) => ({
                              ...prev,
                              [p._id]: reader.result,
                            }));
                          reader.readAsDataURL(file);
                        }}
                      />
                      <button
                        type="button"
                        disabled={!panditImg[p._id]}
                        onClick={() => {
                          const formData = new FormData();
                          formData.append("photo", panditImg[p._id]);
                          uploadPanditPhoto(p._id, formData).then(fetchPandits);
                        }}
                      >
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PanditsPage;
