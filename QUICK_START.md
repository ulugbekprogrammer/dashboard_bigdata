# Quick Start Guide - ClassicModels Dashboard

## 🚀 Start the Application in 5 Minutes

### Step 1: Copy the Database File
```bash
# Copy classicmodels.sql to the dashboard folder
cp "C:\Users\urako\Downloads\Telegram Desktop\classicmodels.sql" d:\dashboard\
```

### Step 2: Import the Database
```bash
# Open MySQL command line and run:
mysql -u root -p < classicmodels.sql

# Or use MySQL Workbench to execute the SQL file
```

### Step 3: Configure Database Connection
Edit `server/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=classicmodels
PORT=5000
```

### Step 4: Run Setup (Windows)
```bash
# Open command prompt in the dashboard folder
setup.bat
```

Or Manual Setup:
```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
cd client
npm install
npm start
```

### Step 5: Open Dashboard
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 📊 Dashboard Pages

1. **Dashboard** - Overview with key metrics and charts
2. **Customers** - Customer list with order and payment data
3. **Orders** - Recent orders with status tracking
4. **Products** - Product inventory and sales data

## 🎨 Features

✅ Real-time data from MySQL  
✅ Beautiful UI with Tailwind CSS  
✅ Interactive charts with Recharts  
✅ Search and filter capabilities  
✅ Responsive design  
✅ RESTful API  

## 🔧 Customization

### Change Colors
Edit `client/tailwind.config.js` to customize the color scheme

### Add More Pages
1. Create new page in `client/src/pages/`
2. Add new API endpoint in `server/server.js`
3. Add navigation item in `client/src/components/Sidebar.js`

### Database Queries
Modify API endpoints in `server/server.js` to fetch different data

## ❌ Common Issues & Solutions

**Database Connection Error**
- Ensure MySQL is running
- Check username/password in `.env`
- Verify database exists: `show databases;`

**Port 5000/3000 Already in Use**
- Change PORT in `server/.env`
- Or kill the process: `netstat -ano | findstr :5000`

**npm install fails**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Update npm: `npm install -g npm@latest`

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js](https://expressjs.com)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)

---

**Happy Coding! 🎉**
