import React, { useState, useEffect } from 'react';
import { studentAPI } from '../api/axiosConfig';

const AdminUpdate = ({ onSuccess, studentId, onCancel }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await studentAPI.getProfile(studentId);
        setFormData(response.data);
      } catch (err) {
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await studentAPI.updateProfile(studentId, formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="tab-content"><p>Loading...</p></div>;

  return (
    <div className="tab-content">
      <h2>Update Student</h2>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {formData && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Previous Year CGPA</label>
              <input
                type="number"
                name="previous_year_cgpa"
                step="0.01"
                value={formData.previous_year_cgpa || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Attendance Percentage</label>
              <input
                type="number"
                name="attendance_percentage"
                step="0.1"
                value={formData.attendance_percentage || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Assignments Submitted</label>
              <input
                type="number"
                name="assignments_submitted"
                value={formData.assignments_submitted || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Study Hours Per Day</label>
              <input
                type="number"
                name="study_hours_per_day"
                step="0.5"
                value={formData.study_hours_per_day || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Extra Curricular Score</label>
              <input
                type="number"
                name="extra_curricular_score"
                step="0.1"
                value={formData.extra_curricular_score || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Internet Usage Hours</label>
              <input
                type="number"
                name="internet_usage_hours"
                step="0.5"
                value={formData.internet_usage_hours || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Final Grade</label>
              <input
                type="text"
                name="final_grade"
                value={formData.final_grade || ''}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Student'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUpdate;
