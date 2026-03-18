import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <div className="header">
      <h2 className="header-title">📚 Academic Performance Predictor</h2>
      {user && (
        <div className="nav-buttons">
          <span>{user.username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Header;
