#!/bin/bash

# Start React Development Server for Student Academic Performance Predictor

echo ""
echo "========================================"
echo "Student Academic Performance Predictor"
echo "React Frontend Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    exit 1
fi

echo "✓ Node.js and npm are installed"
echo ""

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies (this may take a few minutes)..."
    echo ""
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "✓ Dependencies are installed"
echo ""
echo "Starting React development server..."
echo ""
echo "The application will open at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start
