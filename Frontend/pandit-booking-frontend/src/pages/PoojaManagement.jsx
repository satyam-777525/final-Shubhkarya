// src/pages/PoojaManagement.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getPoojas, addPooja, updatePooja, deletePooja } from "../api/api";
import "./PoojaManagement.css";

function PoojaManagement() {
  const [poojas, setPoojas] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPoojas();
  }, []);

  async function fetchPoojas() {
    try {
      const res = await getPoojas();
      setPoojas(res.data || []);
    } catch (_) {}
  }

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      setMessage("Pooja name is required");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (editId) {
        await updatePooja(editId, form);
        setEditId(null);
        setMessage("Pooja updated successfully");
      } else {
        await addPooja(form);
        setMessage("Pooja added successfully");
      }
      setForm({ name: "", description: "", imageUrl: "" });
      fetchPoojas();
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form, editId]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this pooja? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deletePooja(id);
      setMessage("Pooja deleted successfully");
      fetchPoojas();
    } catch (error) {
      setMessage("Failed to delete pooja");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(p) {
    setEditId(p._id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
    });
    setMessage("");
  }

  const filteredPoojas = useMemo(
    () =>
      poojas.filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const name = p.name || "";
        const desc = p.description || "";
        return (
          name.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
        );
      }),
    [poojas, search]
  );

  const total = poojas.length;
  const totalFiltered = filteredPoojas.length;
  const hasImagePreview = form.imageUrl && form.imageUrl.startsWith("http");

  return (
    <div className="pooja-mgmt-page">
      {/* Breadcrumb */}
      <div className="pooja-topbar">
        <span className="crumb-main">Admin</span>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">Pooja Management</span>
      </div>

      {/* Header */}
      <header className="pooja-header">
        <div className="pooja-title-block">
          <div className="pooja-title-row">
            <div className="pooja-title-icon">🪔</div>
            <div>
              <h2>Pooja Management</h2>
              <p className="pooja-subtitle">
                Create, update and organize all pooja offerings visible on
                Shubhkarya platform.
              </p>
            </div>
          </div>
          <span className="pooja-badge">
            {total} items {totalFiltered !== total && `· ${totalFiltered} visible`}
          </span>
        </div>

        <div className="pooja-header-card">
          <div className="pooja-stats">
            <div className="stat-chip">
              <span className="stat-label">Total poojas</span>
              <strong className="stat-value">{total}</strong>
            </div>
            <div className={`stat-chip stat-chip--${totalFiltered === total ? 'primary' : 'warning'}`}>
              <span className="stat-label">Filtered</span>
              <strong className="stat-value">{totalFiltered}</strong>
            </div>
          </div>
          <div className="pooja-header-note">
            {loading ? "Saving..." : "Use form below to manage pooja catalog"}
          </div>
        </div>
      </header>

      {/* Status message */}
      {message && (
        <div className={`pooja-message ${loading ? 'loading' : ''}`}>
          {message}
        </div>
      )}

      {/* Main layout */}
      <section className="pooja-layout-section">
        <div className="pooja-left-column">
          {/* Quick search */}
          <div className="pooja-search-card">
            <label htmlFor="pooja-search">Quick search</label>
            <input
              id="pooja-search"
              placeholder="Type to filter poojas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Add/Edit form */}
          <div className="pooja-form-card">
            <div className="pooja-form-header">
              <h3>{editId ? "Edit Pooja" : "Add New Pooja"}</h3>
              {editId && (
                <span className="pooja-form-pill">Editing</span>
              )}
            </div>

            <div className="pooja-form-fields">
              <div className="pooja-field">
                <label>Pooja name <span className="required">*</span></label>
                <input
                  placeholder="e.g. Maha Shivratri Puja"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div className="pooja-field">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the pooja ritual..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="pooja-field">
                <label>Image URL (optional)</label>
                <input
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                />
                {hasImagePreview && (
                  <div className="pooja-image-preview">
                    <img 
                      src={form.imageUrl} 
                      alt="Preview" 
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pooja-form-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !form.name.trim()}
              >
                {loading ? "Saving..." : editId ? "Update Pooja" : "Add Pooja"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditId(null);
                    setForm({ name: "", description: "", imageUrl: "" });
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pooja cards grid */}
        <div className="pooja-right-column">
          {filteredPoojas.length === 0 ? (
            <div className="pooja-empty">
              <div className="empty-icon">🪔</div>
              <p>{search ? "No poojas match your search" : "No poojas yet"}</p>
              <span>Get started by adding your first pooja above</span>
            </div>
          ) : (
            <div className="pooja-grid">
              {filteredPoojas.map((p) => (
                <article className="pooja-card" key={p._id}>
                  <div className="pooja-card-header">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="pooja-image" />
                    ) : (
                      <div className="pooja-placeholder">
                        {p.name?.[0]?.toUpperCase() || "P"}
                      </div>
                    )}
                  </div>
                  <div className="pooja-card-content">
                    <h3 className="pooja-name">{p.name}</h3>
                    <p className="pooja-desc">
                      {p.description || "No description available"}
                    </p>
                  </div>
                  <div className="pooja-card-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => startEdit(p)}
                      title="Edit pooja"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDelete(p._id)}
                      title="Delete pooja"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PoojaManagement;
