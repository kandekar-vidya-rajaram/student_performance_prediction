# Student Academic Performance Predictor - React Frontend

A modern React-based frontend for the Student Academic Performance Prediction System.

## 🚀 Features

- **User Authentication**: Login and signup with role-based access (Admin/Student)
- **Admin Dashboard**: Manage students, add/edit/delete records, view analytics
- **Student Portal**: View personal performance predictions and analytics
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time API Integration**: Communicates with Flask backend

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Flask backend running on `http://localhost:5000`

## 🔧 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## 🎯 Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📦 Build for Production

Create an optimized production build:
```bash
npm run build
```

## 🗂️ Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── axiosConfig.js          # API configuration and endpoints
│   ├── components/
│   │   ├── Header.js               # Header component
│   │   ├── Home.js                 # Landing page
│   │   ├── Login.js                # Login page
│   │   ├── Signup.js               # Signup page
│   │   ├── ForgotPassword.js       # Password reset page
│   │   ├── StudentHome.js          # Student dashboard
│   │   ├── AdminHome.js            # Admin dashboard
│   │   ├── AdminInsert.js          # Add/Edit student
│   │   ├── AdminUpdate.js          # Update student
│   │   ├── AdminDelete.js          # Delete confirmation
│   │   └── ProtectedRoute.js       # Route protection
│   ├── context/
│   │   └── AuthContext.js          # Authentication state management
│   ├── styles/
│   │   └── App.css                 # Main stylesheet
│   ├── App.js                      # Main App component with routing
│   ├── index.js                    # React entry point
│   └── index.css                   # Global styles
├── package.json
└── README.md
```

## 🔑 Key Components

### AuthContext
Manages user authentication state and provides login/logout functions.

### API Configuration
`axiosConfig.js` handles all API calls to the backend:
- Authentication endpoints (login, signup, forgot password)
- Student endpoints (get, add, update, delete)
- Analytics endpoints

### Protected Routes
`ProtectedRoute.js` ensures only authenticated users can access specific pages based on their role.

## 🌐 Environment Configuration

Update the API base URL in `src/api/axiosConfig.js` if your backend is running on a different URL:

```javascript
const API_BASE_URL = 'http://localhost:5000'; // Change this if needed
```

## 🎨 Styling

The application uses a clean, modern design with:
- Blue color scheme (#4078c0)
- Gradient backgrounds
- Responsive cards and forms
- Professional typography

All styles are in `src/styles/App.css`

## 🔒 Authentication Flow

1. User visits landing page
2. Click Login/Signup
3. Enter credentials and select role (Admin/Student)
4. Backend validates and returns success/error
5. User is redirected to their dashboard based on role
6. Token/session is stored in localStorage

## 📊 Admin Features

- View all students in a table
- Add new students
- Edit existing student information
- Delete students
- View analytics and performance trends

## 👤 Student Features

- View personal dashboard
- Get performance predictions
- View other students' data
- Update personal profile

## 🚨 Troubleshooting

### Backend Connection Error
- Ensure Flask backend is running on port 5000
- Check CORS configuration in backend
- Verify API_BASE_URL in `axiosConfig.js`

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### Port Already in Use
- On Windows: `netstat -ano | findstr :3000`
- Change the port in `package.json` scripts

## 📝 License

This project is part of the Student Academic Performance Prediction System.

## 📧 Support

For issues and questions, please contact the development team.
