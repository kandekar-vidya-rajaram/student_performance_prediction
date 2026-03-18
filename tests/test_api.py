import unittest
import requests

class TestAPI(unittest.TestCase):
    BASE_URL = "http://localhost:5000"

    def test_login_student(self):
        response = requests.post(f"{self.BASE_URL}/login", json={
            "username": "student1",
            "password": "pass123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["role"], "student")

    def test_login_admin(self):
        response = requests.post(f"{self.BASE_URL}/login", json={
            "username": "admin1",
            "password": "admin123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["role"], "admin")

    def test_login_invalid(self):
        response = requests.post(f"{self.BASE_URL}/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["success"])

if __name__ == "__main__":
    unittest.main()