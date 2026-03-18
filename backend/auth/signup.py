from flask import Blueprint, request, jsonify
import mysql.connector

signup_bp = Blueprint('signup_bp', __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="studacaddb"
    )

# @signup_bp.route('/signup', methods=['POST'])
# def signup():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     role = data.get('role', 'student')  # Default to 'student' if not provided

#     if not username or not password:
#         return jsonify({'success': False, 'error': 'Username and password are required'}), 400

#     conn = get_db_connection()
#     cursor = conn.cursor()

#     # Check if username already exists
#     cursor.execute("SELECT id FROM student_credentials WHERE username = %s", (username,))
#     if cursor.fetchone():
#         cursor.close()
#         conn.close()
#         return jsonify({'success': False, 'error': 'User already exists'}), 409

#     # Insert new user with role
#     cursor.execute(
#         "INSERT INTO student_credentials (username, password, role) VALUES (%s, %s, %s)",
#         (username, password, role)
#     )
#     conn.commit()
#     cursor.close()
#     conn.close()

#     return jsonify({'success': True, 'message': 'Signup successful'}), 201

