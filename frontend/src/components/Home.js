import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #eaf1fb 0%, #f5f6fa 100%)' }}>
      <div className="hero">
        <h1>🎓 Student Academic Performance Predictor</h1>
        <p>Predict and analyze student performance with AI-powered insights</p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
            style={{ maxWidth: '200px' }}
          >
            Login
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/signup')}
            style={{ maxWidth: '200px' }}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '50px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3>📊 Analytics</h3>
            <p>View detailed analytics and performance trends</p>
          </div>
          <div className="card">
            <h3>🔮 Predictions</h3>
            <p>Get accurate performance predictions</p>
          </div>
          <div className="card">
            <h3>📈 Tracking</h3>
            <p>Track student progress over time</p>
          </div>
          <div className="card">
            <h3>🛡️ Secure</h3>
            <p>Secure authentication and data protection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
