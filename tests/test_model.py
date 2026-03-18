import unittest
import numpy as np
import sys
import os

# Adjust import path if needed
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'models'))
from prediction import predict_performance

class TestModel(unittest.TestCase):
    def test_predict_performance_valid_input(self):
        # Example input, replace with actual feature values and length
        sample_input = [1, 0.5, -0.3, 2, 0.8, 1.2, 0.5, 0.4, 0.9, -0.9, 2.8]
        result = predict_performance(sample_input)
        self.assertIsInstance(result, int)

    def test_predict_performance_invalid_input(self):
        # Input with wrong length should raise an error
        with self.assertRaises(Exception):
            predict_performance([1, 2, 3])  # Too short

if __name__ == "__main__":
    unittest.main()