import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, studentAPI } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { login, setError, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  // student-specific fields
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'student') {
      if (!studentId.trim() || !studentName.trim()) {
        setError('Please provide both student ID and name');
        return;
      }
      // override credentials: username = studentId, password = studentName
      setUsername(studentId);
      setPassword(studentName);
      setConfirmPassword(studentName);
    }

    setLoading(true);

    try {
      const response = await authAPI.signup(username, password, role);
      if (response.data.success || response.status === 200) {
        // if student, also insert blank profile record
        if (role === 'student') {
          try {
            await studentAPI.addStudent({
              student_id: studentId,
              student_name: studentName,
              gender: '',
              previous_year_cgpa: 0,
              attendance_percentage: 0,
              assignments_submitted: 0,
              study_hours_per_day: 0,
              extra_curricular_score: 0,
              internet_usage_hours: 0,
              final_grade: 0,
            });
          } catch (err) {
            console.warn('student_data creation failed', err.message);
          }
        }
        // after registering, send user to login page rather than auto-login
        navigate('/login');
        setError('Signup successful; please log in.');
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #eaf1fb 0%, #f5f6fa 100%)' }}>
      <div className="form-container" style={{ maxWidth: '400px' }}>
        <h2 style={{ color: '#4078c0', textAlign: 'center', marginBottom: '30px' }}>Sign Up</h2>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
            {role === 'student' && (
            <>
              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose username"
              required
              disabled={role === 'student'}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#4078c0', textDecoration: 'none', fontWeight: 'bold' }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
