# 🛠️ Developer Guide - Extending ClassicModels Dashboard

## Table of Contents
1. [Adding New Pages](#adding-new-pages)
2. [Creating API Endpoints](#creating-api-endpoints)
3. [Adding Components](#adding-components)
4. [Database Modifications](#database-modifications)
5. [Styling & Design](#styling--design)
6. [Testing & Debugging](#testing--debugging)
7. [Performance Optimization](#performance-optimization)
8. [Deployment](#deployment)

---

## Adding New Pages

### Step 1: Create Page Component

Create `client/src/pages/Analytics.js`:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/analytics/data');
        setData(res.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Advanced analytics and reporting</p>
      </div>

      {/* Your content here */}
    </div>
  );
}
```

### Step 2: Update Sidebar

Edit `client/src/components/Sidebar.js`:

```javascript
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🛍️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' }  // Add new tab
];
```

### Step 3: Update App.js

```javascript
import Analytics from './pages/Analytics';

function App() {
  const renderContent = () => {
    switch(activeTab) {
      // ... existing cases ...
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };
  // ...
}
```

### Step 4: Create API Endpoint

See [Creating API Endpoints](#creating-api-endpoints) section.

---

## Creating API Endpoints

### Simple GET Endpoint

In `server/server.js`:

```javascript
// Get custom report
app.get('/api/reports/custom', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [data] = await connection.query(`
      SELECT 
        p.productLine,
        COUNT(o.orderNumber) as totalOrders,
        SUM(od.quantityOrdered) as totalUnits,
        SUM(od.quantityOrdered * od.priceEach) as revenue
      FROM products p
      LEFT JOIN orderdetails od ON p.productCode = od.productCode
      LEFT JOIN orders o ON od.orderNumber = o.orderNumber
      GROUP BY p.productLine
      ORDER BY revenue DESC
    `);
    
    connection.release();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### POST Endpoint with Parameters

```javascript
app.post('/api/customers/search', async (req, res) => {
  try {
    const { name, country } = req.body;
    const connection = await pool.getConnection();
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    
    if (name) {
      query += ' AND customerName LIKE ?';
      params.push(`%${name}%`);
    }
    
    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }
    
    const [results] = await connection.query(query, params);
    connection.release();
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Call from React

```javascript
const [results, setResults] = useState([]);

const handleSearch = async () => {
  try {
    const res = await axios.post('/api/customers/search', {
      name: searchName,
      country: selectedCountry
    });
    setResults(res.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Adding Components

### Create Reusable Component

Create `client/src/components/DataTable.js`:

```javascript
import React from 'react';

export default function DataTable({ 
  columns, 
  data, 
  onRowClick,
  striped = true 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`border-b cursor-pointer transition-colors ${
                  striped && rowIdx % 2 === 0 ? 'bg-gray-50' : ''
                } hover:bg-blue-50`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-gray-900">
                    {col.render 
                      ? col.render(row[col.key], row) 
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Usage

```javascript
import DataTable from '../components/DataTable';

const columns = [
  { key: 'customerName', label: 'Customer Name' },
  { key: 'city', label: 'City' },
  { 
    key: 'totalPayment', 
    label: 'Total Payment',
    render: (value) => `$${value.toFixed(2)}`
  }
];

<DataTable 
  columns={columns} 
  data={customers}
  onRowClick={(row) => console.log(row)}
/>
```

---

## Database Modifications

### Add New Table

```sql
CREATE TABLE IF NOT EXISTS promotions (
  promotionId INT PRIMARY KEY AUTO_INCREMENT,
  promotionName VARCHAR(100) NOT NULL,
  discountPercent DECIMAL(5,2),
  startDate DATE,
  endDate DATE,
  productCode VARCHAR(15),
  FOREIGN KEY (productCode) REFERENCES products(productCode)
);
```

### Migrate Data

```javascript
// In server/server.js - add migration function
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    const tables = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'classicmodels'
    `);
    
    // Check if table exists, if not create it
    connection.release();
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Call on server startup
initializeDatabase();
```

### Update Query with New Data

```javascript
app.get('/api/products/with-promotions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [data] = await connection.query(`
      SELECT 
        p.*,
        pr.promotionName,
        pr.discountPercent
      FROM products p
      LEFT JOIN promotions pr ON p.productCode = pr.productCode
      WHERE pr.endDate >= CURDATE() OR pr.endDate IS NULL
    `);
    
    connection.release();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Styling & Design

### Add Custom CSS Classes

Edit `client/src/App.css`:

```css
.card-hover {
  @apply transition-all duration-300 hover:shadow-lg hover:scale-105;
}

.badge-success {
  @apply bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium;
}

.badge-warning {
  @apply bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium;
}

.fade-in {
  @apply animate-fadeIn;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Extend Tailwind Configuration

Edit `client/tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        success: '#22c55e',
        warning: '#eab308',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## Testing & Debugging

### Test API Endpoints

Using `curl`:
```bash
# Test GET endpoint
curl http://localhost:5000/api/dashboard/summary

# Test POST endpoint
curl -X POST http://localhost:5000/api/customers/search \
  -H "Content-Type: application/json" \
  -d '{"name":"Atelier"}'
```

Using Postman:
1. Create new Collection
2. Add requests for each endpoint
3. Set base URL: `http://localhost:5000/api`
4. Test and debug

### Debug React Components

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Navigate to React tab
4. Inspect component state and props
5. Check Network tab for API calls

### Debug Backend

Add logging to server:

```javascript
app.get('/api/debug/test', async (req, res) => {
  console.log('Request received');
  
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    
    const [data] = await connection.query('SELECT 1');
    console.log('Query result:', data);
    
    connection.release();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Performance Optimization

### Frontend

```javascript
// 1. Memoize Components
import React, { memo } from 'react';

const StatCard = memo(function StatCard({ title, value }) {
  return <div>...</div>;
});

// 2. Lazy Load Pages
import { lazy, Suspense } from 'react';

const Analytics = lazy(() => import('./pages/Analytics'));

<Suspense fallback={<div>Loading...</div>}>
  <Analytics />
</Suspense>

// 3. Debounce Search
import { useCallback } from 'react';

const debouncedSearch = useCallback(
  debounce((value) => {
    handleSearch(value);
  }, 300),
  []
);
```

### Backend

```javascript
// 1. Add Query Caching
const NodeCache = require('node-cache');
const cache = new NodeCache();

app.get('/api/dashboard/summary', async (req, res) => {
  const cacheKey = 'dashboard-summary';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // ... fetch from database ...
  
  cache.set(cacheKey, result, 300); // Cache for 5 minutes
  res.json(result);
});

// 2. Add Database Indexing
// In classicmodels database:
CREATE INDEX idx_customer_name ON customers(customerName);
CREATE INDEX idx_order_date ON orders(orderDate);
CREATE INDEX idx_payment_date ON payments(paymentDate);
```

---

## Deployment

### Deploy to Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-user
heroku config:set DB_PASSWORD=your-password
heroku config:set DB_NAME=classicmodels

# Deploy
git push heroku main
```

### Deploy to DigitalOcean

```bash
# Create droplet and SSH in

# Install Node and MySQL
sudo apt update
sudo apt install nodejs npm mysql-server

# Clone repository
git clone your-repo

# Install and run
cd dashboard/server && npm install && npm start
cd ../client && npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

### Deploy React to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel

# Update API endpoint in environment
```

---

## Best Practices

### Code Organization
- ✅ Keep components small and focused
- ✅ Separate business logic from UI
- ✅ Use meaningful names
- ✅ Add comments for complex logic

### Error Handling
- ✅ Always try-catch API calls
- ✅ Show user-friendly error messages
- ✅ Log errors for debugging
- ✅ Handle loading states

### Performance
- ✅ Minimize re-renders
- ✅ Cache API responses
- ✅ Lazy load components
- ✅ Use database indexes

### Security
- ✅ Validate input on backend
- ✅ Use environment variables
- ✅ Never expose secrets
- ✅ Sanitize user input

---

## Resources

- [React Best Practices](https://react.dev/learn)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MySQL Query Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Happy Developing! 🚀**
