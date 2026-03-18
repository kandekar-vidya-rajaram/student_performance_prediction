import pandas as pd
import mysql.connector
from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)
student_bp = Blueprint('student_bp', __name__)

# Load your CSV
df = pd.read_csv(r'C:\Users\userp\OneDrive\Desktop\Student-academic-performance-prediction\data\Student_Academic_Performance_Preprocessed.csv')

# Connect to MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="studacaddb"
)
cursor = conn.cursor()

for _, row in df.iterrows():
    try:
        cursor.execute(
            "INSERT INTO student_data (cdstudent_id, student_name, gender, previous_year_cgpa, attendance_percentage, assignments_submitted, study_hours_per_day, extra_curricular_score, internet_usage_hours, final_grade) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                row['cdstudent_id'],
                row['student_name'],
                row['gender'],
                row['previous_year_cgpa'],
                row['attendance_percentage'],
                row['assignments_submitted'],
                row['study_hours_per_day'],
                row['extra_curricular_score'],
                row['internet_usage_hours'],
                row['final_grade']
            )
        )
    except mysql.connector.errors.IntegrityError:
        # Duplicate entry, skip
        pass

conn.commit()
cursor.close()
conn.close()

@app.route('/student/feedback', methods=['GET'])
def student_feedback():
    student_id = request.args.get('student_id')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM student_data WHERE cdstudent_id=%s", (student_id,))
    student = cursor.fetchone()
    feedback = []
    if student:
        if student['previous_year_cgpa'] < 5.0:
            feedback.append("Focus on strengthening fundamentals. Review past weak areas and seek help early.")
        if student['attendance_percentage'] < 60:
            feedback.append("Try to attend classes more regularly — presence in lectures directly boosts understanding and grades.")
        if student['assignments_submitted'] < 50:
            feedback.append("Submitting assignments on time builds discipline and reinforces concepts. Make this a priority.")
        if student['study_hours_per_day'] < 2:
            feedback.append("Increase daily study time, even by 30 minutes. Consistency matters more than cramming.")
        if student['extra_curricular_score'] > 7 and student['final_grade'] < 7.0:
            feedback.append("Great job balancing activities! Now channel that energy into academics with structured study plans.")
        if student['internet_usage_hours'] > 4:
            feedback.append("Limit non-academic screen time. Use the internet for learning resources, not distractions.")
    cursor.close()
    conn.close()
    return jsonify({"feedback": feedback})

@student_bp.route('/student/profile', methods=['GET'])
def student_profile():
    student_id = request.args.get('student_id')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM student_data WHERE cdstudent_id=%s", (student_id,))
    student = cursor.fetchone()
    cursor.close()
    conn.close()
    if student:
        return jsonify({"success": True, "student": student})
    else:
        return jsonify({"success": False, "message": "Student not found"})

@app.route('/student/status', methods=['GET'])
def student_status():
    cdstudent_id = request.args.get('cdstudent_id')
    student_name = request.args.get('student_name')
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="studacaddb"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM student_data WHERE cdstudent_id=%s AND student_name=%s", (cdstudent_id, student_name))
    student = cursor.fetchone()
    cursor.close()
    conn.close()
    if not student:
        return jsonify({"success": False})

    # Extract attributes
    cgpa = float(student.get("previous_year_cgpa", 0))
    attendance = float(student.get("attendance_percentage", 0))
    assignments = float(student.get("assignments_submitted", 0))
    study_hours = float(student.get("study_hours_per_day", 0))
    extra_curricular = float(student.get("extra_curricular_score", 0))
    internet_usage = float(student.get("internet_usage_hours", 0))
    final_grade = float(student.get("final_grade", 0))

    # Status logic
    reasons = []
    if cgpa < 5.0:
        reasons.append("CGPA is below 5.0")
    if attendance < 60:
        reasons.append("Attendance is below 60%")
    if assignments < 50:
        reasons.append("Assignments submitted are below 50")
    if study_hours < 2:
        reasons.append("Study hours per day are below 2")
    if final_grade < 5.0:
        reasons.append("Final grade is below 5.0")

    if (
        cgpa < 5.0 or
        attendance < 60 or
        assignments < 50 or
        study_hours < 2 or
        final_grade < 5.0
    ):
        status = "At Risk"
        status_color = "#e74c3c"
    elif (
        cgpa >= 7.0 and
        attendance >= 80 and
        assignments >= 80 and
        study_hours >= 3 and
        final_grade >= 7.0 and
        extra_curricular >= 5 and
        internet_usage <= 3
    ):
        status = "Good"
        status_color = "#2ecc71"
    else:
        status = "Average"
        status_color = "#f1c40f"

    # Feedback logic
    feedback = []
    if cgpa < 5.0:
        feedback.append("Focus on strengthening fundamentals. Review past weak areas and seek help early.")
    if attendance < 60:
        feedback.append("Try to attend classes more regularly — presence in lectures directly boosts understanding and grades.")
    if assignments < 50:
        feedback.append("Submitting assignments on time builds discipline and reinforces concepts. Make this a priority.")
    if study_hours < 2:
        feedback.append("Increase daily study time, even by 30 minutes. Consistency matters more than cramming.")
    if extra_curricular > 7 and final_grade < 7.0:
        feedback.append("Great job balancing activities! Now channel that energy into academics with structured study plans.")
    if internet_usage > 4:
        feedback.append("Limit non-academic screen time. Use the internet for learning resources, not distractions.")

    # Always show motivational feedback if none of the above conditions are met
    if not feedback:
        feedback.append("Keep up the good work! Stay consistent and continue striving for excellence.")

    breakdown = [
        {"attribute": "Attendance", "student_value": f"{attendance}%", "ideal_value": "≥ 75%", "result": "❌ Low" if attendance < 75 else "✔️ Good"},
        {"attribute": "Assignments", "student_value": f"{assignments}", "ideal_value": "≥ 70", "result": "❌ Low" if assignments < 70 else "✔️ Good"},
        {"attribute": "CGPA", "student_value": f"{cgpa}", "ideal_value": "≥ 7.0", "result": "❌ Low" if cgpa < 7.0 else "✔️ Good"},
        {"attribute": "Study Hours", "student_value": f"{study_hours} hr/day", "ideal_value": "≥ 2 hr/day", "result": "❌ Low" if study_hours < 2 else ("⚠ Average" if study_hours < 3 else "✔️ Good")},
        {"attribute": "Extra Curricular", "student_value": f"{extra_curricular}", "ideal_value": "≤ 7 if grades low", "result": "⚠ Check Balance" if extra_curricular > 7 and final_grade < 7.0 else "✔️ Balanced"},
        {"attribute": "Internet Usage", "student_value": f"{internet_usage} hrs/day", "ideal_value": "≤ 4 hrs/day", "result": "❌ High" if internet_usage > 4 else "✔️ Good"},
        {"attribute": "Final Grade", "student_value": f"{final_grade}", "ideal_value": "≥ 7.0", "result": "❌ Low" if final_grade < 7.0 else "✔️ Good"}
    ]

    gender_code = student.get("gender")
    if gender_code == 1 or gender_code == "1":
        gender = "Male"
    elif gender_code == 0 or gender_code == "0":
        gender = "Female"
    else:
        gender = "Other"

    return jsonify({
        "success": True,
        "cdstudent_id": cdstudent_id,
        "student_name": student_name,
        "gender": gender,
        "attendance_percentage": attendance,
        "assignments_submitted": assignments,
        "previous_year_cgpa": cgpa,
        "study_hours_per_day": study_hours,
        "extra_curricular_score": extra_curricular,
        "internet_usage_hours": internet_usage,
        "final_grade": final_grade,
        "status": status,
        "status_color": status_color,
        "reasons": reasons,
        "feedback": feedback,
        "breakdown": breakdown
    })

if __name__ == "__main__":
    app.run(debug=True)

app.register_blueprint(student_bp)