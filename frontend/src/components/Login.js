import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, setError, error } = useAuth();
  const [activeTab, setActiveTab] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(username, password, activeTab);
      if (response.data.success) {
        const userObj = {
          username,
          role: activeTab,
          id: Math.random().toString(36),
        };
        if (activeTab === 'student') {
          // backend may supply student_id and student_name
          userObj.student_id = response.data.student_id || username;
          userObj.student_name = response.data.student_name || '';
        }
        login(userObj);
        navigate(activeTab === 'admin' ? '/admin' : '/student');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #eaf1fb 0%, #f5f6fa 100%)' }}>
      <div className="form-container" style={{ maxWidth: '400px' }}>
        <h2 style={{ color: '#4078c0', textAlign: 'center', marginBottom: '30px' }}>Login</h2>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('admin')}
            style={{ flex: 1 }}
          >
            Admin
          </button>
          <button
            className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('student')}
            style={{ flex: 1 }}
          >
            Student
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{activeTab === 'student' ? 'Student ID' : 'Username'}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={activeTab === 'student' ? 'Enter student ID' : 'Enter username'}
              required
            />
          </div>
          {activeTab === 'student' && (
            <p style={{ fontSize: '12px', color: '#666' }}>
              Login with your student ID and your full name.
            </p>
          )}

          <div className="form-group">
            <label>{activeTab === 'student' ? 'Student Name' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={activeTab === 'student' ? 'Enter your full name' : 'Enter password'}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: '#4078c0', textDecoration: 'none', fontWeight: 'bold' }}>
            Sign up
          </a>
        </p>

        <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
          <a href="/forgot-password" style={{ color: '#4078c0', textDecoration: 'none' }}>
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
