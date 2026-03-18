from flask import Blueprint, request, jsonify
import mysql.connector
from config import DB_CONFIG

auth_bp = Blueprint('auth_bp', __name__)

def get_db_connection():
    return mysql.connector.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"]
    )

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # 'admin' or 'student'

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if role == 'admin':
        cursor.execute("SELECT * FROM admins WHERE username=%s AND password=%s", (username, password))
        user = cursor.fetchone()
        if user:
            cursor.close()
            conn.close()
            return jsonify({"success": True, "role": "admin"})
    elif role == 'student':
        cursor.execute("SELECT * FROM student_credentials WHERE username=%s AND password=%s", (username, password))
        user = cursor.fetchone()
        if user:
            # also fetch basic student data (id/name) if it exists
            cursor.execute("SELECT cdstudent_id, student_name FROM student_data WHERE cdstudent_id=%s", (username,))
            stu = cursor.fetchone()
            resp = {"success": True, "role": "student", "username": username}
            if stu:
                resp.update({"student_id": stu.get('cdstudent_id'), "student_name": stu.get('student_name')})
            cursor.close()
            conn.close()
            return jsonify(resp)

    cursor.close()
    conn.close()
    return jsonify({"success": False, "message": "Invalid credentials"})

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student')  # Default role is student

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if role == 'admin':
            cursor.execute(
                "INSERT INTO admins (username, password) VALUES (%s, %s)",
                (username, password)
            )
        else:
            # Insert into student_credentials table
            cursor.execute(
                "INSERT INTO student_credentials (username, password) VALUES (%s, %s)",
                (username, password)
            )
        conn.commit()
        result = {"success": True, "message": "User registered successfully."}
    except mysql.connector.errors.IntegrityError:
        result = {"success": False, "message": "Username already exists."}
    finally:
        cursor.close()
        conn.close()

    return jsonify(result)