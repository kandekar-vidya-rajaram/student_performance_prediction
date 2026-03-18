import pandas as pd
import matplotlib.pyplot as plt
import os

# Load your preprocessed dataset
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'Student_Academic_Performance_Preprocessed.csv')
df = pd.read_csv(data_path)

# Example: Plot average CGPA trend over years (adjust column names as needed)
if 'year' in df.columns and 'previous_year_cgpa' in df.columns:
    trend = df.groupby('year')['previous_year_cgpa'].mean()
    plt.figure(figsize=(8,5))
    plt.plot(trend.index, trend.values, marker='o', color='b')
    plt.title('Average CGPA Trend Over Years')
    plt.xlabel('Year')
    plt.ylabel('Average CGPA')
    plt.grid(True)
    plt.tight_layout()
    # Save the plot as an image
    output_path = os.path.join(os.path.dirname(__file__), 'performance_trend.png')
    plt.savefig(output_path)
    plt.close()
    print(f"Performance trend plot saved to {output_path}")
else:
    print("Required columns 'year' and 'previous_year_cgpa' not found in the dataset.")