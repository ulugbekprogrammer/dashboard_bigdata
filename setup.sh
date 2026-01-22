#!/bin/bash

echo "🚀 Starting ClassicModels Dashboard Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node -v)"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..
echo "✅ Server dependencies installed"
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..
echo "✅ Client dependencies installed"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MySQL is running"
echo "2. Import the database: mysql -u root -p < classicmodels.sql"
echo "3. Configure server/.env with your database credentials"
echo "4. Start server: cd server && npm start"
echo "5. Start client: cd client && npm start"
echo ""
