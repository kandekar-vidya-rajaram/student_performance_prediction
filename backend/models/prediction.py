import joblib
import numpy as np
import os

# Adjust the path to your .pkl model file
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'model', 'student_model.pkl')
model = joblib.load(MODEL_PATH)

def predict_performance(input_data):
    """
    Predict student performance label.
    input_data: list or numpy array of shape (n_features,)
    Returns: predicted label (int)
    """
    input_array = np.array(input_data).reshape(1, -1)
    prediction = model.predict(input_array)
    return int(prediction[0])

# Example usage
if __name__ == "__main__":
    # Example input (replace with actual feature values in correct order)
    sample_input = [1, 0.5, -0.3, 2, 0.8, 1.2, 0.5, 0.4, 0.9, -0.9, 2.8]
    label = predict_performance(sample_input)
    print("Predicted performance label:", label)