# API Documentation - ClassicModels Dashboard

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Dashboard Endpoints

#### Get Dashboard Summary
```
GET /dashboard/summary
```

**Response**:
```json
{
  "totalCustomers": 122,
  "totalOrders": 326,
  "totalRevenue": 9604101.00,
  "totalProducts": 110
}
```

**Usage**:
```javascript
axios.get('/api/dashboard/summary')
```

---

#### Get Monthly Revenue
```
GET /revenue/monthly
```

**Response**:
```json
[
  {
    "month": "2004-12",
    "revenue": "419964.84"
  },
  {
    "month": "2004-11",
    "revenue": "521532.88"
  }
]
```

**Usage**:
```javascript
axios.get('/api/revenue/monthly')
```

---

### Customer Endpoints

#### Get All Customers
```
GET /customers
```

**Response**:
```json
[
  {
    "customerNumber": 103,
    "customerName": "Atelier graphique",
    "city": "Nantes",
    "country": "France",
    "orderCount": 5,
    "totalPayment": 92727.00
  }
]
```

**Query Parameters**:
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Usage**:
```javascript
axios.get('/api/customers')
```

---

#### Get Top Customers
```
GET /customers/top
```

**Response**:
```json
[
  {
    "customerNumber": 114,
    "customerName": "Australian Collectors, Co.",
    "country": "Australia",
    "totalSpent": 216262.81
  }
]
```

**Limit**: Returns top 10 customers

**Usage**:
```javascript
axios.get('/api/customers/top')
```

---

### Order Endpoints

#### Get Recent Orders
```
GET /orders/recent
```

**Response**:
```json
[
  {
    "orderNumber": 10425,
    "orderDate": "2005-05-09",
    "status": "Shipped",
    "customerName": "Toys4GrownUps.com",
    "total": 2082.90
  }
]
```

**Limit**: Returns last 10 orders

**Usage**:
```javascript
axios.get('/api/orders/recent')
```

---

### Product Endpoints

#### Get All Products
```
GET /products
```

**Response**:
```json
[
  {
    "productCode": "S10_1678",
    "productName": "1969 Harley Davidson Ultimate Chopper",
    "productLine": "Motorcycles",
    "quantityInStock": 7933,
    "buyPrice": "48.81",
    "MSRP": "95.70",
    "orderCount": 15
  }
]
```

**Limit**: Returns 20 products

**Usage**:
```javascript
axios.get('/api/products')
```

---

#### Get Product Lines
```
GET /product-lines
```

**Response**:
```json
[
  {
    "productLine": "Classic Cars",
    "productCount": 38,
    "totalStock": 33584
  }
]
```

**Usage**:
```javascript
axios.get('/api/product-lines')
```

---

## Error Responses

### 500 Internal Server Error
```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Causes**:
- Database connection failed
- Invalid query
- Server configuration issue

**Solution**:
- Check MySQL is running
- Verify database credentials in `.env`
- Check server console for error details

---

## Request/Response Formats

### Headers
```
Content-Type: application/json
```

### Request Example
```javascript
const response = await axios.get('/api/dashboard/summary', {
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- Request rate limiting (e.g., 100 requests per minute)
- Query result caching
- Database connection pooling

---

## Performance Tips

1. **Caching**: Implement Redis for frequent queries
2. **Pagination**: Use LIMIT and OFFSET for large datasets
3. **Indexes**: Database indexes on frequently queried columns
4. **Connection Pool**: Adjust pool size in `server.js`

---

## Security Considerations

### Current Implementation
- CORS enabled for localhost
- No authentication/authorization
- No input validation/sanitization

### For Production
- Implement JWT authentication
- Add input validation with express-validator
- Use environment variables for sensitive data
- Enable HTTPS/SSL
- Implement proper CORS policy
- Add rate limiting
- Use prepared statements (already using mysql2)

---

## Testing Endpoints

### Using curl
```bash
# Test dashboard summary
curl http://localhost:5000/api/dashboard/summary

# Test customers
curl http://localhost:5000/api/customers

# Test recent orders
curl http://localhost:5000/api/orders/recent

# Test products
curl http://localhost:5000/api/products
```

### Using Postman
1. Import these endpoints into Postman
2. Set base URL to `http://localhost:5000/api`
3. Create a collection with all endpoints
4. Test each endpoint

### Using axios in JavaScript
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Get dashboard data
api.get('/dashboard/summary')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

---

## Extending the API

### Adding a New Endpoint

1. **In `server/server.js`**:
```javascript
app.get('/api/new-endpoint', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [data] = await connection.query('SELECT * FROM table');
    connection.release();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. **In React Component**:
```javascript
useEffect(() => {
  axios.get('/api/new-endpoint')
    .then(res => setData(res.data))
    .catch(err => console.error(err));
}, []);
```

---

## Troubleshooting API Issues

### CORS Error
**Error**: "Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked"

**Solution**: Check CORS is enabled in `server.js`
```javascript
app.use(cors());
```

### 404 Not Found
**Error**: "Cannot GET /api/endpoint"

**Solution**: Check endpoint name matches exactly in server.js

### Connection Timeout
**Error**: "ETIMEDOUT" or "ECONNREFUSED"

**Solution**: 
1. Ensure server is running
2. Check port in `.env` matches proxy in `package.json`

---

## Database Queries Reference

Common queries used in the API:

```sql
-- Total customers
SELECT COUNT(*) as count FROM customers;

-- Total revenue
SELECT SUM(amount) as total FROM payments;

-- Recent orders with customer info
SELECT o.*, c.customerName FROM orders o
JOIN customers c ON o.customerNumber = c.customerNumber
ORDER BY o.orderDate DESC LIMIT 10;

-- Monthly revenue
SELECT DATE_FORMAT(paymentDate, '%Y-%m') as month,
       SUM(amount) as revenue
FROM payments
GROUP BY DATE_FORMAT(paymentDate, '%Y-%m');
```

---

**API Documentation v1.0**
Last Updated: January 2026
