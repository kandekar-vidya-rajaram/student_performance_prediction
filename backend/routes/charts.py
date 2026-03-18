# Example: backend/routes/charts.py

from flask import Blueprint, jsonify
from config import DB_CONFIG
import mysql.connector

charts_bp = Blueprint('charts_bp', __name__)

def get_db_connection():
    return mysql.connector.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"]
    )

@charts_bp.route('/students/performance-summary', methods=['GET'])
def performance_summary():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT cdstudent_id, student_name, previous_year_cgpa, attendance_percentage,
               assignments_submitted, study_hours_per_day, extra_curricular_score,
               internet_usage_hours, final_grade
        FROM student_data
    """)
    students = cursor.fetchall()
    conn.close()

    summary = {"at_risk": [], "average": [], "good": []}
    for s in students:
        surname = s["student_name"].split()[-1] if s["student_name"] else ""
        student_info = {
            "cdstudent_id": s["cdstudent_id"],
            "student_name": s["student_name"],
            "surname": surname
        }
        cgpa = float(s.get("previous_year_cgpa", 0))
        attendance = float(s.get("attendance_percentage", 0))
        assignments = float(s.get("assignments_submitted", 0))
        study_hours = float(s.get("study_hours_per_day", 0))
        extra_curricular = float(s.get("extra_curricular_score", 0))
        internet_usage = float(s.get("internet_usage_hours", 0))
        final_grade = float(s.get("final_grade", 0))

        # Categorization logic (adjust thresholds as needed)
        if (
            cgpa < 5.0 or
            attendance < 60 or
            assignments < 50 or
            study_hours < 2 or
            final_grade < 5.0
        ):
            summary["at_risk"].append(student_info)
        elif (
            cgpa >= 7.0 and
            attendance >= 80 and
            assignments >= 80 and
            study_hours >= 3 and
            final_grade >= 7.0 and
            extra_curricular >= 5 and
            internet_usage <= 3
        ):
            summary["good"].append(student_info)
        else:
            summary["average"].append(student_info)
    return jsonify(summary)