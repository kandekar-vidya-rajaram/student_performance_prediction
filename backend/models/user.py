class Admin:
    def __init__(self, admin_id, username, password):
        self.admin_id = admin_id
        self.username = username
        self.password = password

    def to_dict(self):
        return {
            "admin_id": self.admin_id,
            "username": self.username
        }

class StudentCredential:
    def __init__(self, student_id, cdstudent_id, username, password):
        self.student_id = student_id
        self.cdstudent_id = cdstudent_id
        self.username = username
        self.password = password

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "cdstudent_id": self.cdstudent_id,
            "username": self.username
        }

class StudentData:
    def __init__(self, student_id, cdstudent_id, student_name, gender, previous_year_cgpa,
                 attendance_percentage, assignments_submitted, study_hours_per_day,
                 extra_curricular_score, internet_usage_hours, final_grade):
        self.student_id = student_id
        self.cdstudent_id = cdstudent_id
        self.student_name = student_name
        self.gender = gender
        self.previous_year_cgpa = previous_year_cgpa
        self.attendance_percentage = attendance_percentage
        self.assignments_submitted = assignments_submitted
        self.study_hours_per_day = study_hours_per_day
        self.extra_curricular_score = extra_curricular_score
        self.internet_usage_hours = internet_usage_hours
        self.final_grade = final_grade

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "cdstudent_id": self.cdstudent_id,
            "student_name": self.student_name,
            "gender": self.gender,
            "previous_year_cgpa": self.previous_year_cgpa,
            "attendance_percentage": self.attendance_percentage,
            "assignments_submitted": self.assignments_submitted,
            "study_hours_per_day": self.study_hours_per_day,
            "extra_curricular_score": self.extra_curricular_score,
            "internet_usage_hours": self.internet_usage_hours,
            "final_grade": self.final_grade
        }