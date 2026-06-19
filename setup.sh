#!/bin/bash

# Support Ticket System - Quick Start Guide

echo "🚀 Support Ticket System - Backend Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "⚙️  Configuration Steps:"
echo "1. Update .env file with your MySQL credentials"
echo "2. Create the database using database.sql file"
echo "3. Run: npm start"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "✅ Setup complete!"
