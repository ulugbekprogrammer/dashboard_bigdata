# ClassicModels Dashboard

A beautiful, full-stack dashboard application built with React.js, Node.js, and MySQL for business analytics.

## Features

- 📊 **Dashboard**: Summary statistics with charts and metrics
- 👥 **Customers**: View and manage customers
- 📦 **Orders**: Track orders and shipments
- 🛍️ **Products**: Product inventory and management
- 📈 **Revenue Analytics**: Monthly revenue tracking
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Setup Instructions

### 1. Database Setup

First, import the classicmodels database:

```bash
mysql -u root -p < classicmodels.sql
```

Or create the database manually:
```bash
mysql -u root -p
mysql> source classicmodels.sql;
```

### 2. Server Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file based on `.env.example`:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=classicmodels
PORT=5000
```

Start the server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Client Setup

In a new terminal, navigate to the client directory:

```bash
cd client
npm install
```

Start the React development server:

```bash
npm start
```

The client will open on `http://localhost:3000`

## Project Structure

```
dashboard/
├── server/
│   ├── server.js          # Express server
│   ├── package.json       # Server dependencies
│   └── .env.example       # Environment variables template
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── StatCard.js    # Stat card component
    │   │   └── Sidebar.js     # Navigation sidebar
    │   ├── pages/
    │   │   ├── Dashboard.js   # Dashboard page
    │   │   ├── Customers.js   # Customers page
    │   │   ├── Orders.js      # Orders page
    │   │   └── Products.js    # Products page
    │   ├── App.js            # Main app component
    │   └── index.js          # Entry point
    ├── public/
    │   └── index.html        # HTML template
    ├── package.json          # Client dependencies
    └── tailwind.config.js    # Tailwind CSS config
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Get summary statistics
- `GET /api/revenue/monthly` - Get monthly revenue data
- `GET /api/customers/top` - Get top customers

### Customers
- `GET /api/customers` - Get all customers

### Orders
- `GET /api/orders/recent` - Get recent orders

### Products
- `GET /api/products` - Get all products
- `GET /api/product-lines` - Get product lines

## Technologies Used

### Frontend
- React 18
- Tailwind CSS
- Recharts
- Lucide React Icons
- Axios

### Backend
- Node.js
- Express.js
- MySQL2
- CORS

## Database Schema

The dashboard uses the ClassicModels sample database with the following main tables:

- **customers** - Customer information
- **orders** - Order details
- **orderdetails** - Order line items
- **products** - Product catalog
- **productlines** - Product categories
- **employees** - Employee information
- **offices** - Office locations
- **payments** - Payment records

## Running in Production

For production deployment:

1. Build the React app:
```bash
cd client
npm run build
```

2. Serve the built files from the Express server or use a separate web server (Nginx, Apache)

3. Update environment variables for production database credentials

4. Use a process manager like PM2 for the Node.js server:
```bash
npm install -g pm2
pm2 start server.js --name "dashboard-server"
```

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `.env` file
- Verify the database exists: `mysql -u root -p classicmodels`

### Port Already in Use
- Change PORT in `.env` (server) or modify the proxy in `package.json` (client)

### CORS Errors
- Ensure the server is running on the correct port
- Check the proxy setting in client `package.json`

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository.
