
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./PanditSignup.css";

export default function PanditSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    experienceYears: "",
    languages: "",
    specialties: "",
    bio: "",
    profile_photo_url: "",
  });

  // ---------- validation per step ----------
  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return "Name is required.";
      if (!form.phone.match(/^[6-9]\d{9}$/))
        return "Enter valid 10‑digit phone.";
      if (!form.email.match(/^\S+@\S+\.\S+$/)) return "Enter valid email.";
    }
    if (step === 2) {
      if (form.password.length !== 8)
        return "Password must be exactly 8 characters.";
      if (!form.confirmPassword) return "Please confirm your password.";
      if (form.password !== form.confirmPassword)
        return "Password and confirm password must match.";
    }
    if (step === 3) {
      if (!form.city.trim()) return "City is required.";
      if (!form.experienceYears) return "Experience is required.";
    }
    return "";
  };

  const nextStep = () => {
    const msg = validateStep();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    // backend still only uses URL string; keep this empty or separate
  };

  // ---------- submit: JSON ONLY (no FormData) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password,
      city: form.city,
      experienceYears: form.experienceYears,
      languages: form.languages
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      specialties: form.specialties
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      bio: form.bio,
      profile_photo_url: form.profile_photo_url, // only URL is sent
    };

    try {
      await axios.post("http://localhost:5000/api/pandits/signup", payload);
      alert(
        "Pandit registered successfully. Please wait for admin verification."
      );
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  // ---------- steps UI ----------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="ps-input-label">Enter Your Full Name</div>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              autoFocus
            />

            <div className="ps-input-label">Enter Your Contact Number</div>
            <input
              name="phone"
              placeholder="10 digit mobile"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
            />

            <div className="ps-input-label">Enter Your Email Address</div>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <motion.button
              type="button"
              onClick={nextStep}
              className="ps-primary-btn ps-full-width"
              whileTap={{ scale: 0.97 }}
            >
              Continue →
            </motion.button>
          </>
        );

      case 2:
        return (
          <>
            <div className="ps-input-label">Create Password</div>
            <div className="ps-pw-field">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Password (8 characters)"
                value={form.password}
                minLength={8}
                maxLength={8}
                onChange={handleChange}
              />
              <span
                className="ps-pw-toggle"
                onClick={() => setShowPass(!showPass)}
                title={showPass ? "Hide" : "Show"}
              >
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="ps-input-label">Confirm Password</div>
            <div className="ps-pw-field">
              <input
                name="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                placeholder="Re‑enter password"
                value={form.confirmPassword}
                minLength={8}
                maxLength={8}
                onChange={handleChange}
              />
              <span
                className="ps-pw-toggle"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                title={showConfirmPass ? "Hide" : "Show"}
              >
                {showConfirmPass ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="ps-step-buttons">
              <button
                type="button"
                onClick={prevStep}
                className="ps-secondary-btn"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="ps-primary-btn"
              >
                Next →
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="ps-input-label">City</div>
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />
            <div className="ps-input-label">Experience (years)</div>
            <input
              name="experienceYears"
              type="number"
              min="0"
              max="80"
              placeholder="Years of Experience"
              value={form.experienceYears}
              onChange={handleChange}
            />
            <div className="ps-input-label">Languages</div>
            <input
              name="languages"
              placeholder="Languages (comma separated)"
              value={form.languages}
              onChange={handleChange}
            />

            <div className="ps-step-buttons">
              <button
                type="button"
                onClick={prevStep}
                className="ps-secondary-btn"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="ps-primary-btn"
              >
                Next →
              </button>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className="ps-input-label">Specialties</div>
            <input
              name="specialties"
              placeholder="Specialties (comma separated)"
              value={form.specialties}
              onChange={handleChange}
            />
            <div className="ps-input-label">Short Bio</div>
            <textarea
              name="bio"
              placeholder="Short Bio"
              rows={2}
              value={form.bio}
              onChange={handleChange}
            />

            <div className="ps-input-label">Upload your Profile Photo</div>
            <div className="ps-upload-row">
              <label className="ps-upload-btn-rect">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
              <span className="ps-upload-text">
                {photoFile ? photoFile.name : "No file chosen"}
              </span>
            </div>

            <div className="ps-input-label">Or Image URL</div>
            <input
              name="profile_photo_url"
              placeholder="https:// or /images/..."
              value={form.profile_photo_url}
              onChange={handleChange}
            />

            {(photoPreview || form.profile_photo_url) && (
              <img
                src={photoPreview || form.profile_photo_url}
                alt="Profile Preview"
                className="ps-profile-preview"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}

            <div className="ps-step-buttons">
              <button
                type="button"
                onClick={prevStep}
                className="ps-secondary-btn"
              >
                ← Back
              </button>
              <button type="submit" className="ps-primary-btn">
                Register as Pandit
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ps-page">
      <div className="ps-shell">
        <div className="ps-left">
          <div className="ps-image-frame">
            <img
              src="/images/signup.png"
              alt="Pandit performing havan"
              className="ps-main-image"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ps-right">
          <div className="ps-step-top">
            <div className="ps-step-dots">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={`ps-step-dot${step === n ? " active" : ""}`}
                >
                  {n}
                </span>
              ))}
            </div>
            <span className="ps-step-text">Step {step} of 4</span>
          </div>

          <div className="ps-heading">
            <h1> Register as Pandit </h1>
            <p>
              Join our sacred community and serve devotees with divine blessings.
            </p>
          </div>

          {error && <div className="ps-error">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="ps-step-wrapper"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="ps-login-link">
            Already have an account?
            <Link to="/login" className="ps-login-link-a">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
