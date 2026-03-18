import React, { useState, useEffect } from 'react';
import { chartsAPI } from '../api/axiosConfig';

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [cpgaData, setCpgaData] = useState(null);
  const [studyData, setStudyData] = useState(null);
  const [topPerformers, setTopPerformers] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, perfRes, cpgaRes, studyRes, topRes, attRes] = await Promise.all([
        chartsAPI.getSummary(),
        chartsAPI.getPerformance(),
        chartsAPI.getCGPADistribution(),
        chartsAPI.getStudyHours(),
        chartsAPI.getTopPerformers(),
        chartsAPI.getAttendanceDistribution(),
      ]);

      setSummary(summaryRes.data);
      setPerformance(perfRes.data);
      setCpgaData(cpgaRes.data);
      setStudyData(studyRes.data);
      setTopPerformers(topRes.data);
      setAttendanceData(attRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="tab-content"><p>Loading analytics...</p></div>;

  return (
    <div className="tab-content">
      <h2>📊 Analytics & Performance Dashboard</h2>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h3>👥 Total Students</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              {summary.total_students}
            </p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <h3>📚 Avg Attendance</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              {summary.avg_attendance}%
            </p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <h3>🎯 Avg CGPA</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              {summary.avg_cgpa}
            </p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <h3>⭐ Avg Final Grade</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              {summary.avg_final_grade}
            </p>
          </div>
        </div>
      )}

      {/* Gender Distribution */}
      {summary?.gender_distribution && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>👫 Gender Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {summary.gender_distribution.map((item, idx) => (
              <div key={idx} style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '18px', color: '#4078c0' }}>
                  {item.gender || 'Unknown'}
                </p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Distribution */}
      {attendanceData?.attendance_distribution && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>📊 Attendance Distribution</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Attendance Range</th>
                  <th>Number of Students</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.attendance_distribution.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.attendance_range}</strong></td>
                    <td>{item.student_count}</td>
                    <td>{summary && ((item.student_count / summary.total_students * 100).toFixed(1))}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CGPA Distribution */}
      {cpgaData?.cgpa_distribution && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>🎓 CGPA Distribution</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>CGPA Range</th>
                  <th>Number of Students</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {cpgaData.cgpa_distribution.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.cgpa_range}</strong></td>
                    <td>{item.student_count}</td>
                    <td>{summary && ((item.student_count / summary.total_students * 100).toFixed(1))}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance by Attendance */}
      {performance?.performance_by_attendance && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>📈 Performance by Attendance Level</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Attendance Range</th>
                  <th>Number of Students</th>
                  <th>Average Final Grade</th>
                </tr>
              </thead>
              <tbody>
                {performance.performance_by_attendance
                  .filter(item => item.attendance_range)
                  .map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.attendance_range}</strong></td>
                      <td>{item.student_count}</td>
                      <td>{item.avg_grade ? item.avg_grade.toFixed(2) : 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Study Hours Analysis */}
      {studyData?.study_hours_analysis && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>📚 Study Hours vs Performance</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Study Hours/Day</th>
                  <th>Students</th>
                  <th>Avg Performance</th>
                  <th>Avg Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {studyData.study_hours_analysis.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.study_hours} hrs</strong></td>
                    <td>{item.student_count}</td>
                    <td>{item.avg_performance ? item.avg_performance.toFixed(2) : 'N/A'}</td>
                    <td>{item.avg_attendance ? item.avg_attendance.toFixed(1) : 'N/A'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers?.top_performers && topPerformers.top_performers.length > 0 && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>🏆 Top 10 Performers</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Previous CGPA</th>
                  <th>Attendance %</th>
                  <th>Final Grade</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.top_performers.map((student, idx) => (
                  <tr key={idx} style={{ background: idx < 3 ? 'rgba(255, 215, 0, 0.1)' : '' }}>
                    <td>
                      <strong>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </strong>
                    </td>
                    <td>{student.cdstudent_id}</td>
                    <td>{student.student_name}</td>
                    <td>{student.previous_year_cgpa?.toFixed(2)}</td>
                    <td>{student.attendance_percentage?.toFixed(1)}%</td>
                    <td><strong>{student.final_grade?.toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="card" style={{ background: '#f0f7ff', borderLeft: '4px solid #4078c0' }}>
        <h3>💡 Key Insights</h3>
        <ul style={{ margin: '15px 0', paddingLeft: '20px' }}>
          <li>
            {summary?.avg_attendance >= 85
              ? '✅ High attendance rate - Students are engaged!'
              : '⚠️ Attendance could be improved'}
          </li>
          <li>
            {summary?.avg_cgpa >= 3.5
              ? '✅ Strong academic performance overall'
              : '✅ Room for improvement in academic scores'}
          </li>
          <li>
            {topPerformers?.top_performers[0]?.final_grade >= 85
              ? '⭐ Top performers achieving excellent grades'
              : ''}
          </li>
          <li>
            Total students in system: <strong>{summary?.total_students}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
