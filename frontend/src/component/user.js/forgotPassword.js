import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from "./InputField";
import "../../css/login.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const notifySuccess = () => toast.success("Password reset link sent to your email.");
  const notifyError = (message) => toast.error(message || "User not found.");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      notifyError("Please enter your email address.");
      return;
    }

    try {
      const res = await fetch('/api/users/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Error sending reset email");
      }

      notifySuccess();
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Reset Your Password</h2>
      <form onSubmit={handleForgotPassword} className="login-form">
        <InputField
          type="email"
          placeholder="Enter your email"
          icon="mail"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="login-button">Send Reset Link</button>
      </form>

      <p className="signup-prompt">
        Remembered your password? <Link to="/login" className="signup-link">Log in</Link>
      </p>

      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
