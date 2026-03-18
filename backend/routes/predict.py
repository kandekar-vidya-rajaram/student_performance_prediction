from flask import Blueprint, request, jsonify
import joblib
import pandas as pd

predict_bp = Blueprint('predict_bp', __name__)

# Load the trained model (adjust path if needed)
model = joblib.load('../../model/student_performance_model.pkl')

@predict_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    input_df = pd.DataFrame([data])
    # Drop unnecessary columns if present
    for col in ['student_id', 'student_name']:
        if col in input_df.columns:
            input_df = input_df.drop(col, axis=1)
    prediction = model.predict(input_df)[0]
    return jsonify({'predicted_final_grade': prediction})