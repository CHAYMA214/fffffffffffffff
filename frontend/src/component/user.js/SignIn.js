import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SocialLogin from './SocialLogin';
import InputField from './InputField';
import '../../css/login.css';
import { useAuth } from '../user.js/auth';
import { ToastContainer, toast } from 'react-toastify';

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const responseGoogle = async (response) => {
    const { credential } = response;

    if (!credential) {
      toast.error('Google login failed: No credential received');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/user/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: credential }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Google login failed');
      }

      const data = await res.json();

      login(data.user, data.token);
      toast.success('Google login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error( 'Google login error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in both fields.');
      return;
    }
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Invalid email or password');
      }

      login(data.user, data.token);
      toast.success('Signed in successfully');
      navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Log in with</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <InputField
          type="email"
          placeholder="Email address"
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Password"
          icon="lock"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Link to="/forgotpassword" className="forgot-password-link">Forgot password?</Link>
        <button type="submit" className="login-button">Log In</button>
      </form>

      <p className="signup-prompt">
        Don&apos;t have an account? <Link to="/signup" className="signup-link">Sign up</Link>
      </p>

      <ToastContainer />
    </div>
  );
};

export default SignIn;
