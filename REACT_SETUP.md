# Quick Start Guide

## 🚀 Getting Started with React Frontend

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Update Backend URL (if needed)
Edit `src/api/axiosConfig.js` and change the API_BASE_URL if your backend is on a different port:
```javascript
const API_BASE_URL = 'http://localhost:5000'; // Change port if needed
```

### Step 3: Start the React App
```bash
npm start
```

This will automatically open `http://localhost:3000` in your browser.

### Step 4: Login
- Use your existing credentials
- Select your role (Admin or Student)
- Click Login

## 📱 Available Routes

| Route | Purpose | Requirements |
|-------|---------|--------------|
| `/` | Home/Landing Page | None |
| `/login` | Login Page | None |
| `/signup` | Sign Up Page | None |
| `/forgot-password` | Password Reset | None |
| `/admin` | Admin Dashboard | Admin role |
| `/student` | Student Dashboard | Student role |

## 🎯 Admin Features
1. **Dashboard**: See total students and quick actions
2. **Manage Students**: View, edit, and delete students
3. **Add Student**: Create new student records
4. **Analytics**: View performance trends and charts

## 👤 Student Features
1. **Dashboard**: View personal information
2. **Predict**: Enter data to get performance predictions
3. **All Students**: Browse other students' information
4. **Profile**: View and manage your profile

## 🔗 API Endpoints Used

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration
- `POST /forgot_password` - Password reset

### Students (Admin)
- `GET /students` - Get all students
- `POST /student` - Add new student
- `GET /student/<id>` - Get student details
- `PUT /student/<id>` - Update student
- `DELETE /student/<id>` - Delete student

### Predictions
- `POST /predict` - Get performance prediction

### Analytics
- `GET /charts` - Get chart data
- `GET /performance_trend` - Get trend data

## 🛠️ Troubleshooting

### Port 3000 Already in Use
Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Then restart: `npm start`

### Backend Connection Issues
1. Make sure Flask backend is running (`python app.py`)
2. Check if port 5000 is accessible
3. Verify CORS is enabled in Flask backend

### Module Errors
```bash
# Delete and reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `build/` folder.

## 🚀 Deployment

The built app can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any web server (Apache, Nginx, etc.)

Just copy the contents of the `build/` folder to your server.

---

**Happy coding! 🎓**
