import pandas as pd
import joblib
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

# Load processed data and model
df = pd.read_csv("../data/Student_Academic_Performance_Preprocessed.csv")
model = joblib.load("student_performance_model.pkl")

# Features and target
X = df.drop(['student_id', 'student_name', 'final_grade'], axis=1)
y = df['final_grade']

# Predict
y_pred = model.predict(X)

# Regression evaluation
mse = mean_squared_error(y, y_pred)
print(f"Regression MSE: {mse:.2f}")

# Scatter plot: Actual vs Predicted
plt.figure(figsize=(6,4))
plt.scatter(y, y_pred, alpha=0.6)
plt.xlabel("Actual Final Grade")
plt.ylabel("Predicted Final Grade")
plt.title("Actual vs Predicted Final Grade")
plt.show()