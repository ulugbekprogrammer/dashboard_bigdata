# Installation Guide - ClassicModels Dashboard

## System Requirements

- **OS**: Windows, macOS, or Linux
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (comes with Node.js)
- **MySQL**: v5.7 or higher
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB

## Installation Steps

### 1. Install Node.js

#### Windows
1. Download from [nodejs.org](https://nodejs.org)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```bash
   node -v
   npm -v
   ```

#### macOS
```bash
# Using Homebrew
brew install node

# Verify
node -v
npm -v
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm

# Verify
node -v
npm -v
```

### 2. Install MySQL

#### Windows
1. Download from [mysql.com](https://mysql.com/downloads/)
2. Run MySQL Server installer
3. Run MySQL Workbench (included)

#### macOS
```bash
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 3. Verify MySQL Installation

```bash
mysql --version
mysql -u root -p
# Enter password (default is empty on Windows)
```

### 4. Clone/Setup Dashboard Project

```bash
# Navigate to your projects folder
cd d:\
mkdir dashboard
cd dashboard

# Create folders if not already created
mkdir server client
```

### 5. Import the Database

```bash
# Copy classicmodels.sql to dashboard folder first
# Then import:
mysql -u root -p classicmodels < classicmodels.sql

# Verify
mysql -u root -p
mysql> use classicmodels;
mysql> show tables;
```

### 6. Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Edit database credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=classicmodels
# PORT=5000

# Test the server
npm start
# Should show: "Server running on port 5000"
```

### 7. Setup Frontend Client

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm start
# Should open http://localhost:3000 in your browser
```

## Verification Checklist

- [ ] Node.js installed (`node -v` shows version)
- [ ] npm installed (`npm -v` shows version)
- [ ] MySQL running (`mysql -u root -p` connects)
- [ ] Database imported (can select classicmodels database)
- [ ] Server dependencies installed (`server/node_modules` exists)
- [ ] Server running on port 5000
- [ ] Client dependencies installed (`client/node_modules` exists)
- [ ] Client accessible at http://localhost:3000
- [ ] Dashboard shows data from MySQL

## Port Configuration

### Default Ports
- Frontend: `3000` (React development server)
- Backend: `5000` (Express.js server)
- MySQL: `3306`

### Change Ports if Needed

**Backend**:
Edit `server/.env`:
```
PORT=5001
```

**Frontend**:
Edit `client/package.json` proxy:
```json
"proxy": "http://localhost:5001"
```

## Troubleshooting

### Issue: "MySQL connection refused"
**Solution**:
1. Ensure MySQL is running
2. Check credentials in `server/.env`
3. Verify database exists: `mysql -u root -p -e "show databases;"`

### Issue: "Port already in use"
**Solution** (Windows):
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the ID)
taskkill /PID <PID> /F
```

### Issue: "npm ERR! code EACCES" (macOS/Linux)
**Solution**:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

### Issue: "Cannot find module 'express'"
**Solution**:
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Issue: "CORS error in browser"
**Solution**:
1. Ensure server is running on port 5000
2. Check proxy in `client/package.json`
3. Restart both servers

## Running in Different Terminals

It's recommended to run server and client in separate terminal windows:

**Terminal 1 - Backend**:
```bash
cd d:\dashboard\server
npm start
```

**Terminal 2 - Frontend**:
```bash
cd d:\dashboard\client
npm start
```

## Production Deployment

### Build the Frontend
```bash
cd client
npm run build
```

This creates an optimized production build in `client/build/`

### Deploy to Server
1. Use PM2 for Node.js process management
2. Use Nginx or Apache to serve React build
3. Use environment variables for database credentials
4. Enable HTTPS/SSL certificate

### Example PM2 Setup
```bash
npm install -g pm2
cd server
pm2 start server.js --name "dashboard"
pm2 save
pm2 startup
```

## Getting Help

If you encounter issues:
1. Check that all services are running (MySQL, Node server)
2. Verify all dependencies are installed
3. Check console error messages
4. Review logs in browser DevTools (F12)
5. Check server terminal for backend errors

## Next Steps

After successful installation:
1. Explore the Dashboard page for overview
2. Check Customers page for customer data
3. Review Orders page for transaction history
4. Examine Products for inventory management
5. Customize the design as needed

---

**Installation Complete! 🎉**

Your ClassicModels Dashboard is now ready to use!
