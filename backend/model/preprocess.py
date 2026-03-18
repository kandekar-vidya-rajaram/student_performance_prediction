import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

def load_data(filepath):
    df = pd.read_csv(filepath)
    return df

def preprocess_data(df):
    # Drop rows with missing values (if any)
    df = df.dropna()

    # Encode categorical columns
    label_encoders = {}
    categorical_cols = ['gender']
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    # Drop student_id and student_name (not useful for ML)
    for col in ['student_id', 'student_name']:
        if col in df.columns:
            df = df.drop(col, axis=1)

    # Scale numerical features
    scaler = StandardScaler()
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns.tolist()
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    return df, label_encoders, scaler

if __name__ == "__main__":
    filepath = r"data\Student_Academic_Performance_Updated_503.csv"
    df = load_data(filepath)
    df_processed, label_encoders, scaler = preprocess_data(df)
    df_processed.to_csv("data\processed_student_performance.csv", index=False)
    print("Preprocessing complete. Processed file saved as data/processed_student_performance.csv")