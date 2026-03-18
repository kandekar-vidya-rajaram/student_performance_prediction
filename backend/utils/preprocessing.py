import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

def preprocess_input(data):
    """
    Preprocess a single input dictionary for prediction.
    - Encodes categorical variables
    - Scales numerical features (if needed, you can load a fitted scaler)
    - Drops unnecessary columns
    """
    input_df = pd.DataFrame([data])

    # Encode gender if present
    if 'gender' in input_df.columns:
        le = LabelEncoder()
        input_df['gender'] = le.fit_transform(input_df['gender'])

    # Drop student_id and student_name if present
    for col in ['student_id', 'student_name']:
        if col in input_df.columns:
            input_df = input_df.drop(col, axis=1)

    # Optionally scale features (if you saved a scaler during training)
    # scaler = joblib.load('path_to_saved_scaler.pkl')
    # input_df = scaler.transform(input_df)

    return input_df