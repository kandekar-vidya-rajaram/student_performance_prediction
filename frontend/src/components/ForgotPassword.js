import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/axiosConfig';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error sending reset email. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #eaf1fb 0%, #f5f6fa 100%)' }}>
        <div className="form-container" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <span>✓</span>
            <span>Password reset email sent successfully! Redirecting to login...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #eaf1fb 0%, #f5f6fa 100%)' }}>
      <div className="form-container" style={{ maxWidth: '400px' }}>
        <h2 style={{ color: '#4078c0', textAlign: 'center', marginBottom: '30px' }}>Reset Password</h2>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Remember your password?{' '}
          <a href="/login" style={{ color: '#4078c0', textDecoration: 'none', fontWeight: 'bold' }}>
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
