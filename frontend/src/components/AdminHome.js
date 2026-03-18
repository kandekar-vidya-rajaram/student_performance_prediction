import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../api/axiosConfig';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import AdminInsert from './AdminInsert';
import Analytics from './Analytics';

const AdminHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predictingStudentId, setPredictingStudentId] = useState(null);

  const [feedbackStudentId, setFeedbackStudentId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackSending, setFeedbackSending] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/login');
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentAPI.getAllStudents();
      setStudents(response.data || []);
    } catch (err) {
      setError('Failed to fetch students: Check backend connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = () => {
    fetchStudents();
    setSuccess('Student added successfully!');
    setTimeout(() => setSuccess(null), 3000);
    setActiveTab('manage');
  };

  const handleStudentDeleted = () => {
    fetchStudents();
    setSuccess('Student deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePredictPerformance = async (student) => {
    setPredictingStudentId(student.cdstudent_id);
    setError(null);
    try {
      const predictionData = {
        previous_year_cgpa: student.previous_year_cgpa || 0,
        attendance_percentage: student.attendance_percentage || 0,
        assignments_submitted: student.assignments_submitted || 0,
        study_hours_per_day: student.study_hours_per_day || 0,
        extra_curricular_score: student.extra_curricular_score || 0,
        internet_usage_hours: student.internet_usage_hours || 0,
        gender: student.gender || 0,
      };

      const response = await studentAPI.predictPerformance(predictionData);
      setPrediction({
        studentId: student.cdstudent_id,
        studentName: student.student_name,
        predictedGrade: response.data.predicted_final_grade,
      });
      setSuccess('Prediction fetched successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(`Failed to fetch prediction: ${err.message}`);
    } finally {
      setPredictingStudentId(null);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackStudentId) {
      setFeedbackStatus({ type: 'error', message: 'Select a student to send feedback.' });
      return;
    }
    if (!feedbackText.trim()) {
      setFeedbackStatus({ type: 'error', message: 'Feedback cannot be empty.' });
      return;
    }

    setFeedbackSending(true);
    setFeedbackStatus(null);

    try {
      const res = await studentAPI.submitFeedback({
        student_id: feedbackStudentId,
        feedback: feedbackText.trim(),
        admin_username: user?.username || 'admin',
      });

      if (res.data?.success) {
        setFeedbackStatus({ type: 'success', message: 'Feedback sent to student successfully.' });
        setFeedbackText('');
      } else {
        setFeedbackStatus({ type: 'error', message: res.data?.message || 'Unable to send feedback' });
      }
    } catch (err) {
      setFeedbackStatus({ type: 'error', message: 'Failed to send feedback: ' + (err.message || err) });
    } finally {
      setFeedbackSending(false);
    }
  };

  const filteredStudents = students.filter((stu) => {
    const term = searchTerm.toLowerCase();
    return (
      stu.cdstudent_id?.toLowerCase().includes(term) ||
      stu.student_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />

      <div className="nav-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'manage' ? 'active' : ''}
          onClick={() => setActiveTab('manage')}
        >
          Manage Students
        </button>
        <button
          className={activeTab === 'insert' ? 'active' : ''}
          onClick={() => { setActiveTab('insert'); setSelectedStudent(null); }}
        >
          Add Student
        </button>
        <button
          className={activeTab === 'charts' ? 'active' : ''}
          onClick={() => setActiveTab('charts')}
        >
          Analytics
        </button>
      </div>

      <div className="container">
        {error && (
          <div className="alert alert-error">
            <span>Warning</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>Success</span>
            <span>{success}</span>
          </div>
        )}

        {prediction && (
          <div className="alert alert-info" style={{ backgroundColor: '#d1ecf1', borderColor: '#bee5eb', marginBottom: '20px' }}>
            <span>Info</span>
            <span>
              <strong>{prediction.studentName}</strong> ({prediction.studentId}): Predicted Final Grade = <strong>{prediction.predictedGrade?.toFixed(2)}</strong>
            </span>
            <button
              onClick={() => setPrediction(null)}
              style={{ marginLeft: '10px', cursor: 'pointer', background: 'none', border: 'none', color: '#004085', fontSize: '16px' }}
            >
              X
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Admin Dashboard</h2>
            <p>Welcome, {user?.username}!</p>
            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="card">
                <h3>Total Students</h3>
                <p style={{ fontSize: '24px', color: '#4078c0', fontWeight: 'bold' }}>{students.length}</p>
              </div>
              <div className="card">
                <h3>Add Students</h3>
                <button className="btn btn-primary" onClick={() => setActiveTab('insert')}>
                  Add New Student
                </button>
              </div>
              <div className="card">
                <h3>View Analytics</h3>
                <button className="btn btn-primary" onClick={() => setActiveTab('charts')}>
                  Go to Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="tab-content">
            <h2>Student Management</h2>

            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Send Feedback to Student</h3>
              <div className="form-group">
                <label>Student:</label>
                <select
                  value={feedbackStudentId}
                  onChange={(e) => setFeedbackStudentId(e.target.value)}
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s.cdstudent_id} value={s.cdstudent_id}>
                      {s.cdstudent_id} - {s.student_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  rows="4"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter message for the student..."
                  style={{ width: '100%', borderRadius: '6px', border: '1px solid #ccc', padding: '10px' }}
                />
              </div>
              <button
                className="btn btn-success"
                onClick={handleSendFeedback}
                disabled={feedbackSending}
              >
                {feedbackSending ? 'Sending...' : 'Send Feedback'}
              </button>
              {feedbackStatus && (
                <div className={`alert ${feedbackStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '12px' }}>
                  {feedbackStatus.message}
                </div>
              )}
            </div>

            {loading && <p>Loading students...</p>}
            {students.length > 0 ? (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="Search by ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', width: '100%', maxWidth: '400px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Previous CGPA</th>
                        <th>Attendance %</th>
                        <th>Assignments</th>
                        <th>Study Hours</th>
                        <th>Extra Curr.</th>
                        <th>Internet Hours</th>
                        <th>Final Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.cdstudent_id}>
                          <td>{student.cdstudent_id}</td>
                          <td>{student.student_name || 'N/A'}</td>
                          <td>{student.gender || 'N/A'}</td>
                          <td>{student.previous_year_cgpa || 'N/A'}</td>
                          <td>{student.attendance_percentage || 'N/A'}</td>
                          <td>{student.assignments_submitted || 'N/A'}</td>
                          <td>{student.study_hours_per_day || 'N/A'}</td>
                          <td>{student.extra_curricular_score || 'N/A'}</td>
                          <td>{student.internet_usage_hours || 'N/A'}</td>
                          <td>{student.final_grade || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setSelectedStudent(student);
                                setActiveTab('insert');
                              }}
                              style={{ marginRight: '10px' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => handlePredictPerformance(student)}
                              disabled={predictingStudentId === student.cdstudent_id}
                              style={{ marginRight: '10px' }}
                            >
                              {predictingStudentId === student.cdstudent_id ? 'Predicting...' : 'Predict'}
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => {
                                if (window.confirm(`Delete student ${student.cdstudent_id}?`)) {
                                  handleStudentDeleted();
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No students found. {!loading && <a href="#insert" onClick={() => setActiveTab('insert')}>Add one now</a>}</p>
            )}
          </div>
        )}

        {activeTab === 'insert' && (
          <AdminInsert
            onSuccess={handleStudentAdded}
            initialStudent={selectedStudent}
            onCancel={() => setSelectedStudent(null)}
          />
        )}

        {activeTab === 'charts' && (
          <Analytics />
        )}
      </div>
    </div>
  );
};

export default AdminHome;
