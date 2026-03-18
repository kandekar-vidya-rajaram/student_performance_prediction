import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib

# Load processed data
df = pd.read_csv("../data/Student_Academic_Performance_Preprocessed.csv")

# Features and target
X = df.drop(['student_id', 'student_name', 'final_grade'], axis=1)
y = df['final_grade']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f"Model trained. Test MSE: {mse:.2f}")

# Save model
joblib.dump(model, "student_performance_model.pkl")
print("Model saved as student_performance_model.pkl")