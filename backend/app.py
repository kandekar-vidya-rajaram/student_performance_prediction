from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import DB_CONFIG
import pandas as pd
import numpy as np
import joblib
import os



app = Flask(__name__)
CORS(app, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
         "allow_headers": ["Content-Type"]
     }},
     supports_credentials=True)

def get_db_connection():
    return mysql.connector.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"]
    )

# Import and register your auth blueprint
from routes.auth import auth_bp
app.register_blueprint(auth_bp)

# Import and register your charts blueprint
from routes.charts import charts_bp
app.register_blueprint(charts_bp)

# Load the trained model
model = None
print("=" * 60)
print("STARTING MODEL LOADING PROCESS")
print("=" * 60)

try:
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(backend_dir, 'model', 'student_performance_model.pkl')
    
    print(f"Backend directory: {backend_dir}")
    print(f"Model path: {model_path}")
    print(f"File exists: {os.path.exists(model_path)}")
    print(f"File size: {os.path.getsize(model_path) if os.path.exists(model_path) else 'N/A'} bytes")
    
    if os.path.exists(model_path):
        print(f"Attempting to load model with joblib...")
        model = joblib.load(model_path)
        print(f"SUCCESS: Model loaded successfully!")
        print(f"Model type: {type(model)}")
    else:
        print(f"ERROR: Model file not found at {model_path}")
        model = None
except Exception as e:
    print(f"ERROR loading model: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    model = None

print("=" * 60)
print(f"FINAL MODEL STATUS: {'LOADED' if model is not None else 'FAILED TO LOAD'}")
print("=" * 60)


@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        if model is None:
            error_msg = 'Model not loaded. Please check if student_performance_model.pkl exists.'
            print(f"Predict error: {error_msg}")
            return jsonify({'error': error_msg}), 500
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        print(f"Received prediction data: {data}")
        
        # Convert input data to DataFrame
        input_df = pd.DataFrame([data])
        print(f"DataFrame shape: {input_df.shape}, columns: {list(input_df.columns)}")
        print(f"DataFrame dtypes before processing:\n{input_df.dtypes}")
        
        # Drop unnecessary columns if present
        for col in ['student_id', 'student_name', 'cdstudent_id']:
            if col in input_df.columns:
                input_df = input_df.drop(col, axis=1)
        
        print(f"After dropping columns - shape: {input_df.shape}, columns: {list(input_df.columns)}")
        
        # Encode categorical variables BEFORE converting to float
        if 'gender' in input_df.columns:
            print(f"Gender values before encoding: {input_df['gender'].values}")
            # Convert gender to numeric: Female=0, Male=1 using str.lower() for case-insensitivity
            input_df['gender'] = input_df['gender'].astype(str).str.lower().replace({
                'female': 0,
                'male': 1,
                '0': 0,
                '1': 1
            })
            print(f"Gender values after encoding: {input_df['gender'].values}")
        
        print(f"DataFrame before float conversion:\n{input_df}")
        
        # Ensure all values are numeric
        try:
            input_df = input_df.astype(float)
        except ValueError as e:
            print(f"Error converting to float: {e}")
            print(f"DataFrame dtypes:\n{input_df.dtypes}")
            print(f"DataFrame values:\n{input_df}")
            raise
        
        print(f"Final DataFrame for prediction:\n{input_df}")
        print(f"DataFrame columns: {list(input_df.columns)}")
        print(f"DataFrame shape: {input_df.shape}")
        
        # Check model's expected features
        print("\n" + "=" * 60)
        print("MODEL FEATURE INSPECTION")
        print("=" * 60)
        if hasattr(model, 'feature_names_in_'):
            expected_features = model.feature_names_in_
            print(f"Model expects these features: {list(expected_features)}")
            print(f"Expected order: {list(expected_features)}")
            print(f"Received features: {list(input_df.columns)}")
            
            # Reorder columns to match model's expected order
            if set(expected_features) == set(input_df.columns):
                print("Feature names match, reordering columns...")
                input_df = input_df[expected_features]
                print(f"Reordered DataFrame columns: {list(input_df.columns)}")
            else:
                missing = set(expected_features) - set(input_df.columns)
                extra = set(input_df.columns) - set(expected_features)
                if missing:
                    print(f"ERROR: Missing features: {missing}")
                if extra:
                    print(f"WARNING: Extra features: {extra}")
                raise ValueError(f"Feature mismatch! Missing: {missing}, Extra: {extra}")
        else:
            print(f"Model does not have feature_names_in_ attribute")
            print(f"Current columns: {list(input_df.columns)}")
        print("=" * 60 + "\n")
        
        # Make prediction
        print(f"Making prediction with model...")
        print(f"Input shape: {input_df.shape}")
        print(f"Input data:\n{input_df}")
        prediction = model.predict(input_df)[0]
        print(f"Prediction result: {prediction}")
        
        return jsonify({'predicted_final_grade': float(prediction)}), 200
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return jsonify({'error': error_msg}), 500


@app.route('/')
def home():
    return "Student Academic Performance Prediction API is running."


# --- Student Status Route (correct scope) ---
@app.route('/students', methods=['GET'])
def get_students():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM student_data")
        students = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(students)
    except Exception as e:
        print("Error fetching students:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/student', methods=['POST'])
def add_student():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO student_data 
            (cdstudent_id, student_name, gender, previous_year_cgpa, attendance_percentage, 
             assignments_submitted, study_hours_per_day, extra_curricular_score, 
             internet_usage_hours, final_grade)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get('student_id'),
            data.get('student_name'),
            data.get('gender'),
            data.get('previous_year_cgpa'),
            data.get('attendance_percentage'),
            data.get('assignments_submitted'),
            data.get('study_hours_per_day'),
            data.get('extra_curricular_score'),
            data.get('internet_usage_hours'),
            data.get('final_grade')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Student added successfully"}), 201
    except Exception as e:
        print("Error adding student:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/student/<student_id>', methods=['GET'])
def get_student(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM student_data WHERE cdstudent_id=%s", (student_id,))
        student = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if student:
            return jsonify(student)
        else:
            return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        print("Error fetching student:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/student/<student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE student_data 
            SET student_name=%s, gender=%s, previous_year_cgpa=%s, attendance_percentage=%s,
                assignments_submitted=%s, study_hours_per_day=%s, extra_curricular_score=%s,
                internet_usage_hours=%s, final_grade=%s
            WHERE cdstudent_id=%s
        """, (
            data.get('student_name'),
            data.get('gender'),
            data.get('previous_year_cgpa'),
            data.get('attendance_percentage'),
            data.get('assignments_submitted'),
            data.get('study_hours_per_day'),
            data.get('extra_curricular_score'),
            data.get('internet_usage_hours'),
            data.get('final_grade'),
            student_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Student updated successfully"})
    except Exception as e:
        print("Error updating student:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/student/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM student_data WHERE cdstudent_id=%s", (student_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Student deleted successfully"})
    except Exception as e:
        print("Error deleting student:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/analytics/summary', methods=['GET'])
def analytics_summary():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Total students
        cursor.execute("SELECT COUNT(*) as total FROM student_data")
        total_students = cursor.fetchone()['total']
        
        # Average attendance
        cursor.execute("SELECT AVG(attendance_percentage) as avg_attendance FROM student_data")
        avg_attendance = cursor.fetchone()['avg_attendance'] or 0
        
        # Average CGPA
        cursor.execute("SELECT AVG(previous_year_cgpa) as avg_cgpa FROM student_data")
        avg_cgpa = cursor.fetchone()['avg_cgpa'] or 0
        
        # Average final grade
        cursor.execute("SELECT AVG(final_grade) as avg_grade FROM student_data WHERE final_grade IS NOT NULL")
        avg_grade = cursor.fetchone()['avg_grade'] or 0
        
        # Gender distribution
        cursor.execute("SELECT gender, COUNT(*) as count FROM student_data GROUP BY gender")
        raw_gender_dist = cursor.fetchall()

        # Normalize gender values for consistent reporting
        def normalize_gender(val):
            if val is None:
                return 'Unknown'
            if isinstance(val, (int, float)):
                if val == 0 or str(val) == '0':
                    return 'Male'
                if val == 1 or str(val) == '1':
                    return 'Female'
                if val == 2 or str(val) == '2':
                    return 'Other'
                return 'Unknown'
            if isinstance(val, str):
                cleaned = val.strip().lower()
                if cleaned in ['male', 'm', '0']:
                    return 'Male'
                if cleaned in ['female', 'f', '1']:
                    return 'Female'
                if cleaned in ['other', 'o', '2']:
                    return 'Other'
                return 'Unknown'
            return 'Unknown'

        gender_map = {'Male': 0, 'Female': 0, 'Other': 0, 'Unknown': 0}
        for row in raw_gender_dist:
            label = normalize_gender(row['gender'])
            gender_map[label] = gender_map.get(label, 0) + int(row['count'])

        gender_dist = [
            {'gender': k, 'count': v}
            for k, v in gender_map.items()
            if v > 0
        ]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "total_students": total_students,
            "avg_attendance": round(float(avg_attendance), 2) if avg_attendance else 0,
            "avg_cgpa": round(float(avg_cgpa), 2) if avg_cgpa else 0,
            "avg_final_grade": round(float(avg_grade), 2) if avg_grade else 0,
            "gender_distribution": gender_dist
        })
    except Exception as e:
        print("Error fetching analytics summary:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/student/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        feedback = data.get('feedback', '').strip()
        admin_username = data.get('admin_username', 'admin').strip() or 'admin'

        if not student_id or not feedback:
            return jsonify({'success': False, 'message': 'student_id and feedback are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(20) NOT NULL,
                admin_username VARCHAR(50) NOT NULL,
                feedback_text TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute(
            "INSERT INTO student_feedback (student_id, admin_username, feedback_text) VALUES (%s, %s, %s)",
            (student_id, admin_username, feedback)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        print('Error submitting feedback:', str(e))
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/student/<student_id>/feedback', methods=['GET'])
def get_student_feedback(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, student_id, admin_username, feedback_text, created_at FROM student_feedback WHERE student_id=%s ORDER BY created_at DESC",
            (student_id,)
        )
        feedback = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'feedback': feedback}), 200
    except Exception as e:
        print('Error fetching feedback:', str(e))
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/analytics/performance', methods=['GET'])
def analytics_performance():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Performance by attendance ranges
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN attendance_percentage >= 90 THEN '90-100%'
                    WHEN attendance_percentage >= 80 THEN '80-89%'
                    WHEN attendance_percentage >= 70 THEN '70-79%'
                    WHEN attendance_percentage >= 60 THEN '60-69%'
                    ELSE 'Below 60%'
                END as attendance_range,
                COUNT(*) as student_count,
                AVG(final_grade) as avg_grade
            FROM student_data
            GROUP BY attendance_range
            ORDER BY attendance_range DESC
        """)
        performance = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"performance_by_attendance": performance})
    except Exception as e:
        print("Error fetching performance analytics:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/analytics/cgpa-distribution', methods=['GET'])
def analytics_cgpa_distribution():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # CGPA distribution
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN previous_year_cgpa >= 3.5 THEN '3.5+'
                    WHEN previous_year_cgpa >= 3.0 THEN '3.0-3.4'
                    WHEN previous_year_cgpa >= 2.5 THEN '2.5-2.9'
                    WHEN previous_year_cgpa >= 2.0 THEN '2.0-2.4'
                    ELSE 'Below 2.0'
                END as cgpa_range,
                COUNT(*) as student_count
            FROM student_data
            WHERE previous_year_cgpa IS NOT NULL
            GROUP BY cgpa_range
        """)
        cgpa_data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"cgpa_distribution": cgpa_data})
    except Exception as e:
        print("Error fetching CGPA distribution:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/analytics/study-hours', methods=['GET'])
def analytics_study_hours():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Study hours correlation with performance
        cursor.execute("""
            SELECT 
                ROUND(study_hours_per_day) as study_hours,
                COUNT(*) as student_count,
                AVG(final_grade) as avg_performance,
                AVG(attendance_percentage) as avg_attendance
            FROM student_data
            WHERE study_hours_per_day IS NOT NULL
            GROUP BY ROUND(study_hours_per_day)
            ORDER BY study_hours
        """)
        study_data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"study_hours_analysis": study_data})
    except Exception as e:
        print("Error fetching study hours analytics:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/analytics/top-performers', methods=['GET'])
def analytics_top_performers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Top 10 performers
        cursor.execute("""
            SELECT 
                cdstudent_id,
                student_name,
                previous_year_cgpa,
                attendance_percentage,
                final_grade
            FROM student_data
            WHERE final_grade IS NOT NULL
            ORDER BY final_grade DESC
            LIMIT 10
        """)
        top_performers = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"top_performers": top_performers})
    except Exception as e:
        print("Error fetching top performers:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/analytics/attendance-distribution', methods=['GET'])
def analytics_attendance_distribution():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Attendance distribution
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN attendance_percentage >= 90 THEN '90-100%'
                    WHEN attendance_percentage >= 80 THEN '80-89%'
                    WHEN attendance_percentage >= 70 THEN '70-79%'
                    WHEN attendance_percentage >= 60 THEN '60-69%'
                    ELSE 'Below 60%'
                END as attendance_range,
                COUNT(*) as student_count
            FROM student_data
            WHERE attendance_percentage IS NOT NULL
            GROUP BY attendance_range
        """)
        attendance_data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"attendance_distribution": attendance_data})
    except Exception as e:
        print("Error fetching attendance distribution:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/student/status', methods=['GET'])
def student_status():
    try:

        cdstudent_id = request.args.get('cdstudent_id', '').strip()
        student_name = request.args.get('student_name', '').strip()
        if not cdstudent_id or not student_name:
            return jsonify({'success': False, 'message': 'Missing student ID or name'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM student_data WHERE TRIM(cdstudent_id)=%s AND TRIM(student_name)=%s", (cdstudent_id, student_name))
        student = cursor.fetchone()
        cursor.close()
        conn.close()

        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404

        # Example: Add more fields as needed for your frontend
        result = {
            'success': True,
            'cdstudent_id': student['cdstudent_id'],
            'student_name': student['student_name'],
            'gender': student.get('gender', ''),
            'attendance_percentage': student.get('attendance_percentage', ''),
            'assignments_submitted': student.get('assignments_submitted', ''),
            'study_hours_per_day': student.get('study_hours_per_day', ''),
            'extra_curricular_score': student.get('extra_curricular_score', ''),
            'internet_usage_hours': student.get('internet_usage_hours', ''),
            'status': student.get('status', 'Unknown'),
            'status_color': '#305a8c',  # You can set color based on status if you want
            'feedback': []  # Add feedback logic if needed
        }
        return jsonify(result)
    except Exception as e:
        import traceback
        print('Error in /student/status:', e)
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)