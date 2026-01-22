# ClassicModels Dashboard - Project Structure

## Complete File Tree

```
d:\dashboard\
│
├── README.md                          # Main project README
├── QUICK_START.md                     # Quick start guide
├── INSTALLATION.md                    # Detailed installation guide
├── API_DOCUMENTATION.md               # API endpoints documentation
├── .gitignore                         # Git ignore file
├── setup.bat                          # Windows setup script
├── setup.sh                           # Linux/Mac setup script
├── classicmodels.sql                  # Database SQL file (copy here)
│
├── server/                            # Backend (Node.js/Express)
│   ├── server.js                      # Main Express server
│   ├── package.json                   # Server dependencies
│   ├── .env.example                   # Environment variables template
│   ├── .env                           # Environment variables (create after setup)
│   └── node_modules/                  # Dependencies (created by npm install)
│
└── client/                            # Frontend (React)
    ├── src/
    │   ├── App.js                     # Root React component
    │   ├── App.css                    # Global styles
    │   ├── index.js                   # React entry point
    │   │
    │   ├── components/
    │   │   ├── StatCard.js            # Reusable stat card component
    │   │   └── Sidebar.js             # Navigation sidebar component
    │   │
    │   ├── pages/
    │   │   ├── Dashboard.js           # Dashboard page with charts
    │   │   ├── Customers.js           # Customers page with table
    │   │   ├── Orders.js              # Orders page with status
    │   │   └── Products.js            # Products page with inventory
    │   │
    │   ├── utils/
    │   │   ├── chartConfig.js         # Chart.js configuration
    │   │   └── helpers.js             # Utility functions
    │   │
    │   └── node_modules/              # Dependencies (created by npm install)
    │
    ├── public/
    │   └── index.html                 # HTML template
    │
    ├── package.json                   # Client dependencies
    ├── tailwind.config.js             # Tailwind CSS configuration
    ├── postcss.config.js              # PostCSS configuration
    └── node_modules/                  # Dependencies (created by npm install)
```

## Component Hierarchy

```
App
├── Sidebar
│   └── Navigation Tabs
│       ├── Dashboard
│       ├── Customers
│       ├── Orders
│       └── Products
│
└── Content Area
    ├── Dashboard Page
    │   ├── StatCard (x4)
    │   ├── Revenue Chart (LineChart)
    │   └── Top Customers List
    │
    ├── Customers Page
    │   ├── Search Bar
    │   └── Customers Table
    │
    ├── Orders Page
    │   └── Orders Table
    │
    └── Products Page
        ├── Search Bar
        └── Products Table
```

## Data Flow

```
Frontend (React)
    ↓
axios.get('/api/endpoint')
    ↓
Express Server (Node.js)
    ↓
MySQL Query
    ↓
Database (ClassicModels)
    ↓
JSON Response
    ↓
React State Update
    ↓
Component Re-render
```

## Key Technologies

### Frontend
- **React 18**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Recharts**: Chart library
- **Lucide React**: Icon library

### Backend
- **Express.js**: Web framework
- **MySQL2**: Database driver with promise support
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management

### Database
- **MySQL**: Relational database
- **ClassicModels**: Sample database with 8 tables

## File Responsibilities

### Server Files

**server.js**
- Express app initialization
- CORS configuration
- Database connection pool
- API route definitions
- Error handling

### Client Files

**App.js**
- Root component
- Tab state management
- Page routing logic

**Sidebar.js**
- Navigation menu
- Tab selection

**Dashboard.js**
- Stats cards display
- Revenue chart
- Top customers list
- Data fetching logic

**Customers.js**
- Customer list table
- Search functionality
- Order and payment aggregation

**Orders.js**
- Recent orders display
- Order status badges
- Date formatting

**Products.js**
- Product inventory table
- Stock status indicators
- Search functionality

**StatCard.js**
- Reusable card component
- Icon display
- Flexible styling

**helpers.js**
- Currency formatting
- Date formatting
- Number formatting
- Status badge colors

**chartConfig.js**
- Chart.js configuration
- Color definitions
- Chart options

## Database Schema Overview

```
classicmodels
├── customers
│   └── Stores customer information
├── orders
│   └── Stores order records
├── orderdetails
│   └── Stores line items in orders
├── products
│   └── Stores product information
├── productlines
│   └── Categorizes products
├── employees
│   └── Stores employee information
├── offices
│   └── Stores office locations
└── payments
    └── Stores payment records
```

## Setup Sequence

1. **Prerequisites**
   - Install Node.js
   - Install MySQL
   - Clone/download project

2. **Database**
   - Import classicmodels.sql
   - Verify tables exist

3. **Backend**
   - npm install in server/
   - Create .env file
   - npm start

4. **Frontend**
   - npm install in client/
   - npm start
   - Verify connection to backend

5. **Verification**
   - Check dashboard loads
   - Verify data displays
   - Test search functionality

## Development Workflow

```
1. Make code changes
2. Save file
3. Browser auto-refreshes (HMR)
4. Check browser console for errors
5. Check server terminal for API errors
6. Debug and repeat
```

## Port Mapping

| Service | Port | URL |
|---------|------|-----|
| MySQL | 3306 | N/A |
| Express Server | 5000 | http://localhost:5000 |
| React App | 3000 | http://localhost:3000 |

## Environment Variables

**.env** (create in server/ folder):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=classicmodels
PORT=5000
```

## Key Dependencies Version

### Backend
- express: ^4.18.2
- mysql2: ^3.6.5
- cors: ^2.8.5
- dotenv: ^16.3.1

### Frontend
- react: ^18.2.0
- react-dom: ^18.2.0
- axios: ^1.6.5
- tailwindcss: ^3.3.6
- chart.js: ^4.4.1
- lucide-react: ^0.294.0

## Common Modifications

### Add New Page
1. Create `client/src/pages/NewPage.js`
2. Create API endpoint in `server/server.js`
3. Add to Sidebar.js tabs
4. Import in App.js

### Add New API Endpoint
1. Add GET/POST in `server/server.js`
2. Query database
3. Return JSON response
4. Call from React component with axios

### Change Colors
1. Edit `client/tailwind.config.js`
2. Update `StatCard.js` color props
3. Modify Sidebar colors

### Modify Database Query
1. Edit query in `server/server.js` endpoint
2. Test in MySQL first
3. Return required fields
4. Update React component to display new fields

---

**Project Structure v1.0**
Ready for development and deployment!
