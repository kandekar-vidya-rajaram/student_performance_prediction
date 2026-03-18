import pandas as pd

# Load the raw CSV file
df = pd.read_csv('Student_Academic_Performance_Updated_503.csv', encoding='latin1')

# Strip whitespace from column names and string fields
df.columns = df.columns.str.strip()
df['student_name'] = df['student_name'].str.strip()
df['gender'] = df['gender'].str.strip()

# Fill missing values with column means (if any)
for col in ['previous_year_cgpa', 'attendance_percentage', 'assignments_submitted', 'study_hours_per_day',
            'extra_curricular_score', 'internet_usage_hours', 'final_grade']:
    if df[col].isnull().any():
        df[col].fillna(df[col].mean(), inplace=True)

# Encode gender: Male=0, Female=1, Other=2
df['gender'] = df['gender'].map({'Male': 0, 'Female': 1, 'Other': 2})

# Save cleaned data
df.to_csv('Student_Academic_Performance_Preprocessed.csv', index=False)

print("Cleaned CSV saved as Student_Academic_Performance_Preprocessed.csv")