#!/bin/bash

# Task Suggestion System Test Runner
# This script runs comprehensive tests for the task suggestion system

echo "🧪 Task Suggestion System Test Runner"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run the tests."
    exit 1
fi

# Check if the server is running
echo "🔍 Checking if server is running..."
if curl -s http://localhost:5000/api/projects > /dev/null; then
    echo "✅ Server is running and accessible"
else
    echo "❌ Server is not accessible at http://localhost:5000"
    echo "💡 Please start the server first:"
    echo "   cd server && npm start"
    exit 1
fi

echo ""
echo "📦 Installing test dependencies..."
npm install node-fetch

echo ""
echo "🚀 Starting comprehensive tests..."
echo "=================================="

# Run the comprehensive test
node run-comprehensive-test.js

echo ""
echo "✅ Tests completed!"
echo "📄 Check the generated report files for detailed results:"
echo "   - comprehensive-test-report.json"
echo "   - api-test-report.json"
echo "   - stress-test-report.json"
