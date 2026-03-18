-- Admins table for admin login
CREATE TABLE IF NOT EXISTS admins (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin'
);

-- Student credentials table for storing student login credentials
CREATE TABLE IF NOT EXISTS student_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student'
);

-- Student data table for storing student information
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
    final_grade FLOAT
);

