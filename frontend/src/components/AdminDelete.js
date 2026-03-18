import React, { useState } from 'react';
import { studentAPI } from '../api/axiosConfig';

const AdminDelete = ({ studentId, studentName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await studentAPI.deleteStudent(studentId);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="modal">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete student <strong>{studentName}</strong> (ID: {studentId})?</p>
        <p style={{ color: '#d9534f' }}>This action cannot be undone.</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDelete;
