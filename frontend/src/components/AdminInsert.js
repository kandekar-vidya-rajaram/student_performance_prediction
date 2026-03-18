import React, { useState, useEffect } from 'react';
import { studentAPI } from '../api/axiosConfig';

const AdminInsert = ({ onSuccess, initialStudent, onCancel }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    gender: '',
    previous_year_cgpa: '',
    attendance_percentage: '',
    assignments_submitted: '',
    study_hours_per_day: '',
    extra_curricular_score: '',
    internet_usage_hours: '',
    final_grade: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (initialStudent) {
      setFormData({
        student_id: initialStudent.cdstudent_id || initialStudent.student_id || '',
        student_name: initialStudent.student_name || '',
        gender: initialStudent.gender || '',
        previous_year_cgpa: initialStudent.previous_year_cgpa || '',
        attendance_percentage: initialStudent.attendance_percentage || '',
        assignments_submitted: initialStudent.assignments_submitted || '',
        study_hours_per_day: initialStudent.study_hours_per_day || '',
        extra_curricular_score: initialStudent.extra_curricular_score || '',
        internet_usage_hours: initialStudent.internet_usage_hours || '',
        final_grade: initialStudent.final_grade || '',
      });
    }
  }, [initialStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (initialStudent && (initialStudent.cdstudent_id || initialStudent.student_id)) {
        // Update student
        const studentId = initialStudent.cdstudent_id || initialStudent.student_id;
        await studentAPI.updateProfile(studentId, formData);
        setSuccess('Student updated successfully!');
      } else {
        // Add new student
        await studentAPI.addStudent(formData);
        setSuccess('Student added successfully!');
        setFormData({
          student_id: '',
          student_name: '',
          gender: '',
          previous_year_cgpa: '',
          attendance_percentage: '',
          assignments_submitted: '',
          study_hours_per_day: '',
          extra_curricular_score: '',
          internet_usage_hours: '',
          final_grade: '',
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>{initialStudent ? 'Update Student' : 'Add New Student'}</h2>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              placeholder="Enter student ID"
              required
              disabled={initialStudent ? true : false}
            />
          </div>

          <div className="form-group">
            <label>Student Name</label>
            <input
              type="text"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
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
              value={formData.previous_year_cgpa}
              onChange={handleChange}
              placeholder="Enter previous year CGPA"
            />
          </div>

          <div className="form-group">
            <label>Attendance Percentage (%)</label>
            <input
              type="number"
              name="attendance_percentage"
              step="0.1"
              value={formData.attendance_percentage}
              onChange={handleChange}
              placeholder="Enter attendance percentage"
            />
          </div>

          <div className="form-group">
            <label>Assignments Submitted</label>
            <input
              type="number"
              name="assignments_submitted"
              value={formData.assignments_submitted}
              onChange={handleChange}
              placeholder="Enter number of assignments submitted"
            />
          </div>

          <div className="form-group">
            <label>Study Hours Per Day</label>
            <input
              type="number"
              name="study_hours_per_day"
              step="0.5"
              value={formData.study_hours_per_day}
              onChange={handleChange}
              placeholder="Enter study hours per day"
            />
          </div>

          <div className="form-group">
            <label>Extra Curricular Score</label>
            <input
              type="number"
              name="extra_curricular_score"
              step="0.1"
              value={formData.extra_curricular_score}
              onChange={handleChange}
              placeholder="Enter extra curricular score"
            />
          </div>

          <div className="form-group">
            <label>Internet Usage Hours</label>
            <input
              type="number"
              name="internet_usage_hours"
              step="0.5"
              value={formData.internet_usage_hours}
              onChange={handleChange}
              placeholder="Enter internet usage hours"
            />
          </div>

          <div className="form-group">
            <label>Final Grade</label>
            <input
              type="text"
              name="final_grade"
              value={formData.final_grade}
              onChange={handleChange}
              placeholder="Enter final grade"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : initialStudent ? 'Update Student' : 'Add Student'}
            </button>
            {initialStudent && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInsert;
