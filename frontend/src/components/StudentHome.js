import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../api/axiosConfig';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const StudentHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  // default to logged‑in student's id if available
  const initialId = user?.student_id || '';
  const [studentId, setStudentId] = useState(initialId);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // whenever studentId or active tab changes to profile/dashboard, refresh data
  useEffect(() => {
    const idStr = studentId != null ? String(studentId) : '';
    if ((activeTab === 'profile' || activeTab === 'dashboard') && idStr.trim()) {
      fetchProfile();
    }
  }, [activeTab, studentId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPerformanceCategory = (grade) => {
    if (grade == null || Number.isNaN(Number(grade))) {
      return { category: 'Unknown', color: '#6c757d', bgColor: '#e9ecef' };
    }

    const val = Number(grade);

    // 10-point scale categories
    if (val >= 9.0 && val <= 10.0) {
      return { category: 'Excellent', color: '#28a745', bgColor: '#d4edda' };
    }
    if (val >= 8.0 && val < 9.0) {
      return { category: 'Very Good', color: '#17a2b8', bgColor: '#d1ecf1' };
    }
    if (val >= 7.0 && val < 8.0) {
      return { category: 'Good', color: '#20c997', bgColor: '#d1f2f0' };
    }
    if (val >= 6.0 && val < 7.0) {
      return { category: 'Average', color: '#ffc107', bgColor: '#fff3cd' };
    }
    if (val < 6.0) {
      return { category: 'At Risk', color: '#dc3545', bgColor: '#f8d7da' };
    }

    // fallback for 4.0 scale
    if (val >= 4.0) return { category: 'Excellent', color: '#28a745', bgColor: '#d4edda' };
    if (val >= 3.5) return { category: 'Good', color: '#20c997', bgColor: '#d1f2f0' };
    if (val >= 3.0) return { category: 'Average', color: '#ffc107', bgColor: '#fff3cd' };
    if (val >= 2.0) return { category: 'Below Average', color: '#fd7e14', bgColor: '#ffe5cc' };
    return { category: 'At Risk', color: '#dc3545', bgColor: '#f8d7da' };
  };

  const formatScale = (grade) => {
    const val = Number(grade);
    if (Number.isNaN(val)) return '/4.0';
    return val > 4.0 ? '/10' : '/4.0';
  };

  const getAISuggestions = (profile) => {
    if (!profile) return [];

    const suggestions = [];
    const attendance = Number(profile.attendance_percentage);
    const studyHours = Number(profile.study_hours_per_day);
    const assignments = Number(profile.assignments_submitted);
    const cgpa = Number(profile.previous_year_cgpa);

    if (!Number.isNaN(attendance) && attendance < 75) {
      suggestions.push('Improve your attendance. Low attendance may negatively affect academic performance.');
    }
    if (!Number.isNaN(studyHours) && studyHours < 2) {
      suggestions.push('Increase your daily study hours to at least 2 hours to see better results.');
    }
    if (!Number.isNaN(assignments) && assignments < 5) {
      suggestions.push('Submit assignments regularly - this boosts learning and prediction accuracy.');
    }
    if (!Number.isNaN(cgpa) && cgpa < 6) {
      suggestions.push('Focus on consistency across exams to improve CGPA and predicted ranks.');
    }

    return suggestions;
  };

  const fetchProfile = async (id = studentId) => {
    // ensure ID is a string
    id = id != null ? String(id) : '';
    // retrieve profile data for the given id or current studentId
    if (!id.trim()) {
      setStudentProfile(null);
      return;
    }
    setProfileLoading(true);
    setError(null);
    try {
      const resp = await studentAPI.getProfile(id);
      setStudentProfile(resp.data);

      // fetch admin feedback for this student
      try {
        const feedbackResp = await studentAPI.getFeedback(id);
        setAdminFeedback(feedbackResp.data?.feedback || []);
      } catch {
        setAdminFeedback([]);
      }

      // populate optional fields if present
      setEmail(resp.data.email || '');
      setAddress(resp.data.address || '');
    } catch (err) {
      setError('Failed to fetch profile');
      setStudentProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePredictForStudent = async () => {
    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }

    // make sure profile is up to date
    await fetchProfile();

    setPredictionLoading(true);
    setError(null);
    try {
      const studentResponse = await studentAPI.getAllStudents();
      const foundStudent = studentResponse.data.find(
        (s) => s.cdstudent_id?.toString().toLowerCase() === studentId.toLowerCase()
      );

      if (!foundStudent) {
        setError('Student ID not found');
        setPredictionLoading(false);
        return;
      }

      const predictionData = {
        previous_year_cgpa: foundStudent.previous_year_cgpa || 0,
        attendance_percentage: foundStudent.attendance_percentage || 0,
        assignments_submitted: foundStudent.assignments_submitted || 0,
        study_hours_per_day: foundStudent.study_hours_per_day || 0,
        extra_curricular_score: foundStudent.extra_curricular_score || 0,
        internet_usage_hours: foundStudent.internet_usage_hours || 0,
        gender: foundStudent.gender || 0,
      };

      const predictionResponse = await studentAPI.predictPerformance(predictionData);
      const predictedGrade = predictionResponse.data.predicted_final_grade;
      const performanceInfo = getPerformanceCategory(predictedGrade);

      setPrediction({
        studentId: foundStudent.cdstudent_id,
        studentName: foundStudent.student_name,
        predictedGrade: predictedGrade,
        category: performanceInfo.category,
        color: performanceInfo.color,
        bgColor: performanceInfo.bgColor,
      });
    } catch (err) {
      setError('Error fetching prediction: ' + err.message);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    const idToUse = user?.student_id || studentId;
    if (!idToUse.trim()) {
      setError('Enter student ID to update');
      return;
    }
    setProfileLoading(true);
    setError(null);
    try {
      const updateData = { email, address };
      if (photoFile) updateData.photo = photoFile.name;
      await studentAPI.updateProfile(idToUse, updateData);
      setError('Profile updated successfully');
      await fetchProfile(idToUse);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };


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
          className={activeTab === 'predict' ? 'active' : ''}
          onClick={() => setActiveTab('predict')}
        >
          Predict
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
      </div>

      <div className="container">
        {error && (
          <div className="alert alert-error">
            <span>Warning</span>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Welcome, {user?.student_name || user?.username}!</h2>
            <p>This is your student dashboard. Use the tabs above to navigate.</p>

            {!prediction && (
              <p style={{ marginTop: '20px', color: '#666' }}>
                Go to the <strong>Predict</strong> tab to get your performance prediction.
              </p>
            )}

            {profileLoading && <p>Loading profile...</p>}
            {studentProfile && (
              <div className="card" style={{ marginTop: '20px' }}>
                <h3>My Current Profile</h3>
                <ul>
                  <li><strong>Student ID:</strong> {studentProfile.cdstudent_id}</li>
                  <li><strong>Name:</strong> {studentProfile.student_name}</li>
                  <li><strong>CGPA (Last Year):</strong> {studentProfile.previous_year_cgpa}</li>
                  <li><strong>Attendance %:</strong> {studentProfile.attendance_percentage}</li>
                  <li><strong>Assignments Submitted:</strong> {studentProfile.assignments_submitted}</li>
                  <li><strong>Study Hours/Day:</strong> {studentProfile.study_hours_per_day}</li>
                  <li><strong>Extracurricular Score:</strong> {studentProfile.extra_curricular_score}</li>
                  <li><strong>Internet Usage Hours:</strong> {studentProfile.internet_usage_hours}</li>
                  {studentProfile.final_grade != null && (
                    <li><strong>Final Grade (Actual):</strong> {Number(studentProfile.final_grade).toFixed(2)}{formatScale(studentProfile.final_grade)}</li>
                  )}
                </ul>
              </div>
            )}

            {studentProfile && studentProfile.final_grade != null && (
              <div className="card" style={{ marginTop: '20px', background: '#f6f8fa' }}>
                <h3>📌 Result Summary</h3>
                <p><strong>Actual Grade:</strong> {Number(studentProfile.final_grade).toFixed(2)}{formatScale(studentProfile.final_grade)}</p>
                <p><strong>Category:</strong> {getPerformanceCategory(Number(studentProfile.final_grade)).category}</p>
              </div>
            )}

            {prediction && (
              <div className="card" style={{ marginTop: '20px' }}>
                <h3>Prediction</h3>
                <p><strong>Predicted Grade:</strong> {prediction.predictedGrade?.toFixed(2)}{formatScale(prediction.predictedGrade)}</p>
                <p><strong>Predicted Category:</strong> {prediction.category}</p>
              </div>
            )}

            <div className="card" style={{ marginTop: '20px' }}>
              <h3>� Feedback from Admin</h3>
              {adminFeedback && adminFeedback.length > 0 ? (
                <div>
                  {adminFeedback.map((item) => (
                    <div key={item.id} style={{ marginBottom: '12px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{item.admin_username || 'Admin'} <span style={{ color: '#666', fontWeight: '400' }}>({new Date(item.created_at).toLocaleString()})</span></p>
                      <p style={{ margin: 0 }}>{item.feedback_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No admin feedback available yet.</p>
              )}
            </div>

            {prediction && (
              <div
                className="card"
                style={{
                  marginTop: '20px',
                  backgroundColor: prediction.bgColor,
                  borderLeft: '5px solid ' + prediction.color,
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <h3 style={{ color: prediction.color, marginTop: 0 }}>
                  Prediction: {prediction.category}
                </h3>
                <p><strong>Predicted Final Grade:</strong> {prediction.predictedGrade?.toFixed(2)}{formatScale(prediction.predictedGrade)}</p>
              </div>
            )}

          </div>
        )}

        {activeTab === 'predict' && (
          <div className="tab-content">
            <h2>Performance Predictor</h2>
            <div className="form-container" style={{ marginTop: '20px', maxWidth: '400px' }}>
              <div className="form-group">
                <label><strong>Enter Your Student ID</strong></label>
                <input
                  type="text"
                  placeholder="e.g., STU001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  style={{ marginBottom: '15px' }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handlePredictForStudent}
                disabled={predictionLoading}
                style={{ width: '100%' }}
              >
                {predictionLoading ? 'Loading...' : 'Get My Prediction'}
              </button>
            </div>

            {prediction && (
              <div
                className="card"
                style={{
                  marginTop: '30px',
                  backgroundColor: prediction.bgColor,
                  borderLeft: '5px solid ' + prediction.color,
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <h3 style={{ color: prediction.color, marginTop: 0 }}>
                  {prediction.category}
                </h3>
                <div style={{ marginTop: '15px' }}>
                  <p><strong>Student ID:</strong> {prediction.studentId}</p>
                  <p><strong>Name:</strong> {prediction.studentName}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: prediction.color }}>
                    <strong>Predicted Final Grade:</strong> {prediction.predictedGrade?.toFixed(2)}{formatScale(prediction.predictedGrade)}
                  </p>
                </div>

                <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                  <h4>Performance Scale:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '10px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                      <strong style={{ color: '#28a745' }}>Excellent:</strong> 9.0 - 10.0
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
                      <strong style={{ color: '#17a2b8' }}>Very Good:</strong> 8.0 - 8.9
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#d1f2f0', borderRadius: '4px' }}>
                      <strong style={{ color: '#20c997' }}>Good:</strong> 7.0 - 7.9
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                      <strong style={{ color: '#ffc107' }}>Average:</strong> 6.0 - 6.9
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                      <strong style={{ color: '#dc3545' }}>At Risk:</strong> below 6.0
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPrediction(null);
                    setStudentId('');
                  }}
                  style={{
                    marginTop: '20px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid ' + prediction.color,
                    color: prediction.color,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>My Profile</h2>
            <div className="form-container" style={{ maxWidth: '400px', marginTop: '10px' }}>
              {!user?.student_id && (
                <>
                  <div className="form-group">
                    <label><strong>Enter Your Student ID</strong></label>
                    <input
                      type="text"
                      placeholder="e.g., STU001"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      style={{ marginBottom: '15px' }}
                    />
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={fetchProfile}
                    disabled={profileLoading}
                    style={{ width: '100%' }}
                  >
                    {profileLoading ? 'Loading...' : 'Load Profile'}
                  </button>
                </>
              )}
              {user?.student_id && (
                <p><strong>Student ID:</strong> {user.student_id}</p>
              )}
            </div>

            {profileLoading && <p>Loading profile...</p>}
            {studentProfile ? (
              <div className="card" style={{ marginTop: '20px' }}>
                <ul>
                  <li><strong>Student ID:</strong> {studentProfile.cdstudent_id || user?.student_id}</li>
                  <li><strong>Name:</strong> {studentProfile.student_name || user?.student_name || '\u2014'}</li>
                </ul>
                <div className="optional-fields" style={{ marginTop: '15px' }}>
                  <div className="form-group">
                    <label>Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address (optional)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Photo (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleProfileUpdate}
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: '20px' }}>No profile data available. Enter your ID above and click Load Profile.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
