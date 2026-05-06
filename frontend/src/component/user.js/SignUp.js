import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../user.js/auth';
import SocialLogin from "./SocialLogin";
import InputField from "./InputField";
import "../../css/login.css";
import { ToastContainer, toast } from 'react-toastify';
const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const res = await fetch('/api/user/login/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId: credentialResponse.credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google login failed');
    login(data.user, data.token);
    navigate('/dashboard');
  } catch (err) {
    toast.error('Google login failed');
  }
};

const handleGoogleFailure = () => {
  toast.error('Google login failed');
};

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    const notify = () => toast("Please fill in all fields.");
    const notify1 = () => toast("Passwords do not match");
    const notify2 = () => toast("Failed create account");

    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
notify();
    return;
    }

    if (password !== confirmPassword) {
      notify1();
      return;
    }

    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
notify2();    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Sign up with</h2>
<SocialLogin
  onGoogleSuccess={handleGoogleSuccess}
  onGoogleFailure={handleGoogleFailure}
/>
      <p className="separator"><span>or</span></p>
      <form onSubmit={handleSubmit} className="login-form">
        <InputField
          type="text"
          name="fullName"
          placeholder="Full Name"
          icon="person"
          onChange={handleChange}
        />
        <InputField
          type="email"
          name="email"
          placeholder="Email address"
          icon="mail"
          onChange={handleChange}
        />
        <InputField
          type="password"
          name="password"
          placeholder="Password"
          icon="lock"
          onChange={handleChange}
        />
        <InputField
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          icon="lock"
          onChange={handleChange}
        />
        <button type="submit" className="login-button">Sign Up</button>
      </form>
      <p className="signup-prompt">
        Already have an account? <Link to="/login" className="signup-link">Log in</Link>
      </p>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
