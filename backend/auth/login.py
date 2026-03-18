from flask import Blueprint, request, jsonify
import mysql.connector
from auth.jwt_utils import generate_token

login_bp = Blueprint('login_bp', __name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="studacaddb"
    )

# @login_bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     if not username or not password:
#         return jsonify({'success': False, 'error': 'Username and password are required'}), 400

#     print("Received username:", username)
#     print("Received password:", password)

#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT username, id, password, role FROM student_credentials WHERE username = %s", (username,))
#     user = cursor.fetchone()
#     cursor.close()
#     conn.close()

#     print("Fetched user from DB:", user)
#     if user:
#         print("Stored password:", user[2])
#         if password == user[2]:
#             return jsonify({
#                 "success": True,
#                 "username": user[0],
#                 "cd_studentid": user[1],
#                 "role": user[3]
#             }), 200
#         else:
#             return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

