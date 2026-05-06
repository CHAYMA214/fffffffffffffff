// SocialLogin.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const SocialLogin = ({ onGoogleSuccess, onGoogleFailure }) => {
  return (
    <div className="social-login-buttons">
      <GoogleLogin
        onSuccess={onGoogleSuccess}
        onError={onGoogleFailure}
        useOneTap
      />
    </div>
  );
};

export default SocialLogin;
