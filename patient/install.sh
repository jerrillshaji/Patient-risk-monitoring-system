#!/bin/bash
# Installation and Development Script for Patient Risk Monitoring System

echo "======================================"
echo "Patient Risk Monitoring System Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the right directory?"
    exit 1
fi

echo "📦 Installing dependencies..."
echo "This may take 1-2 minutes..."
echo ""

# Install dependencies
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "======================================"
echo "To start the development server, run:"
echo "======================================"
echo ""
echo "npm run dev"
echo ""
echo "Then open your browser to:"
echo "http://localhost:5173"
echo ""
echo "======================================"
echo "To build for production, run:"
echo "======================================"
echo ""
echo "npm run build"
echo ""
echo "======================================"
