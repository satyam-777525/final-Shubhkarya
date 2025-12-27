import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/api';
import './Signup.css';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    address: '',
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 700 });
  }, []);

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = "Enter your full name.";
      if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = "Valid 10-digit phone required.";
    }
    if (step === 2) {
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) errs.email = "Invalid email.";
      if (!form.password || form.password.length < 8) errs.password = "Password must be 8+ chars.";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const nextStep = () => {
    const err = validateStep();
    if (Object.keys(err).length) { setErrors(err); return; }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step > 1 ? step - 1 : 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (Object.keys(err).length) { setErrors(err); return; }
    try {
      await signup(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrors({ api: err.response?.data?.error || 'Signup failed.' });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <>
          <div className="input-group" data-aos="fade-right">
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} autoFocus />
            {errors.name && <span className="signup-error">{errors.name}</span>}
          </div>
          <div className="input-group" data-aos="fade-right">
            <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} maxLength={10} />
            {errors.phone && <span className="signup-error">{errors.phone}</span>}
          </div>
          <motion.button type="button" onClick={nextStep} className="primary-btn" whileTap={{ scale: 0.97 }}>Next</motion.button>
        </>
      );
      case 2: return (
        <>
          <div className="input-group" data-aos="fade-up">
            <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
            {errors.email && <span className="signup-error">{errors.email}</span>}
          </div>
          <div className="input-group" data-aos="fade-up">
            <div className="pw-wrapper">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Password (8+ characters)"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <span className="pw-toggle" title={showPass ? "Hide" : "Show"} onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>
            {errors.password && <span className="signup-error">{errors.password}</span>}
          </div>
          <div className="input-group" data-aos="fade-up">
            <input
              name="confirmPassword"
              type={showPass ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="signup-error">{errors.confirmPassword}</span>}
          </div>
          <div className="step-buttons">
            <motion.button type="button" onClick={prevStep} className="secondary-btn" whileTap={{ scale: 0.97 }}>Back</motion.button>
            <motion.button type="button" onClick={nextStep} className="primary-btn" whileTap={{ scale: 0.97 }}>Next</motion.button>
          </div>
        </>
      );
      case 3: return (
        <>
          <div className="input-group" data-aos="fade-up">
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
          </div>
          <div className="input-group" data-aos="fade-up">
            <input name="address" placeholder="Complete Address" value={form.address} onChange={handleChange} />
          </div>
          <div className="step-buttons">
            <motion.button type="button" onClick={prevStep} className="secondary-btn" whileTap={{ scale: 0.97 }}>Back</motion.button>
            <motion.button type="submit" className="primary-btn" whileTap={{ scale: 0.96 }}>Register</motion.button>
          </div>
          {errors.api && <motion.div className="signup-error api-error" animate={{ x: [-10,0,10,0] }}>{errors.api}</motion.div>}
        </>
      );
      default: return null;
    }
  };

  const backgroundStyle = {
    minHeight: '100vh',
    backgroundImage: `linear-gradient(135deg, #fac56999 50%, #ffe6c633 50%), url('/images/ganeshji.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  };

  if (success)
    return (
      <div style={backgroundStyle}>
        <motion.div className="glass-form" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1.08, opacity: 1 }}>
          <img src="/images/i5.jpeg" alt="Signup Success" className="signup-success-logo" />
          <h2 className="signup-success-title">Registration Successful!</h2>
          <div className="success-anim">
            <span role="img" aria-label="success" style={{fontSize: "2.3em"}}>🎉</span>
          </div>
          <p className="signup-success-msg">Redirecting to login...</p>
        </motion.div>
      </div>
    );

  return (
    <div style={backgroundStyle}>
      <form onSubmit={handleSubmit} className="glass-form" data-aos="zoom-in" autoComplete="off">
        <img src="/images/subh.png" alt="Portal Logo" className="signup-logo" />
        <h2>Create Your Account</h2>
        {/* <h3>Welcome Devotee!</h3> */}
        <p className="step-indicator">Step {step} of 3</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
            className="animated-step"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        <div className="login-link">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ffd369", fontWeight: 600 }}>Login</Link>
        </div>
      </form>
    </div>
  );
}