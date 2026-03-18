import mysql.connector

def init_db():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="studacaddb"
    )
    cursor = conn.cursor()
    # Create admins table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'admin'
        )
    """)
    # Create student_credentials table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_credentials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'student'
        )
    """)
    # Create student_data table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cdstudent_id VARCHAR(20) NOT NULL UNIQUE,
            student_name VARCHAR(50) NOT NULL,
            gender VARCHAR(10),
            previous_year_cgpa FLOAT,
            attendance_percentage FLOAT,
            assignments_submitted INT,
            study_hours_per_day FLOAT,
            extra_curricular_score FLOAT,
            internet_usage_hours FLOAT,
            final_grade FLOAT,
            FOREIGN KEY (cdstudent_id) REFERENCES student_credentials(cdstudent_id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized and admins/student_credentials/student_data tables created.")