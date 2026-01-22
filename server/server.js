const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check for root path so deployments don't 404
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Dashboard API is running' });
});

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ulugbek007',
  database: process.env.DB_NAME || 'classicmodels',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Database Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'NOT SET',
  database: process.env.DB_NAME
});

// Dashboard Summary API
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [totalCustomers] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [totalOrders] = await connection.query('SELECT COUNT(*) as count FROM orders');
    const [totalRevenue] = await connection.query('SELECT SUM(amount) as total FROM payments');
    const [totalProducts] = await connection.query('SELECT COUNT(*) as count FROM products');
    
    connection.release();
    
    res.json({
      totalCustomers: totalCustomers[0].count,
      totalOrders: totalOrders[0].count,
      totalRevenue: totalRevenue[0].total || 0,
      totalProducts: totalProducts[0].count
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recent Orders API
app.get('/api/orders/recent', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [orders] = await connection.query(`
      SELECT o.orderNumber, o.orderDate, o.status, c.customerName, 
             SUM(od.quantityOrdered * od.priceEach) as total
      FROM orders o
      JOIN customers c ON o.customerNumber = c.customerNumber
      LEFT JOIN orderdetails od ON o.orderNumber = od.orderNumber
      GROUP BY o.orderNumber
      ORDER BY o.orderDate DESC
      LIMIT 10
    `);
    
    connection.release();
    res.json(orders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [customers] = await connection.query(`
      SELECT c.customerNumber, c.customerName, c.city, c.country, 
             COUNT(o.orderNumber) as orderCount,
             SUM(p.amount) as totalPayment
      FROM customers c
      LEFT JOIN orders o ON c.customerNumber = o.customerNumber
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY c.customerNumber
      ORDER BY c.customerName
      LIMIT 20
    `);
    
    connection.release();
    res.json(customers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const { limit = 10000 } = req.query;
    const connection = await pool.getConnection();
    
    // First get the cutoff date from recent orders
    const [cutoffResult] = await connection.query(`
      SELECT orderDate 
      FROM orders 
      ORDER BY orderDate DESC 
      LIMIT ?
    `, [parseInt(limit)]);
    
    const cutoffDate = cutoffResult.length > 0 ? cutoffResult[cutoffResult.length - 1].orderDate : '1900-01-01';
    
    const [products] = await connection.query(`
      SELECT p.productCode, p.productName, p.productLine, p.quantityInStock, 
             p.buyPrice, p.MSRP,
             COUNT(DISTINCT od.orderNumber) as orderCount
      FROM products p
      LEFT JOIN orderdetails od ON p.productCode = od.productCode
      LEFT JOIN orders o ON od.orderNumber = o.orderNumber AND o.orderDate >= ?
      GROUP BY p.productCode
      ORDER BY orderCount DESC
      LIMIT 20
    `, [cutoffDate]);
    
    connection.release();
    res.json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Revenue by Month API
app.get('/api/revenue/monthly', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [revenue] = await connection.query(`
      SELECT DATE_FORMAT(p.paymentDate, '%Y-%m') as month,
             SUM(p.amount) as revenue
      FROM payments p
      GROUP BY DATE_FORMAT(p.paymentDate, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    connection.release();
    res.json(revenue);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Daily Revenue API (for filtering)
app.get('/api/revenue/daily', async (req, res) => {
  try {
    const { limit = 365 } = req.query;
    const query = `
      SELECT DATE(p.paymentDate) as date,
             SUM(p.amount) as revenue
      FROM payments p
      GROUP BY DATE(p.paymentDate)
      ORDER BY DATE(p.paymentDate) DESC
      LIMIT ?
    `;
    
    const connection = await pool.getConnection();
    const [revenue] = await connection.query(query, [parseInt(limit)]);
    connection.release();
    res.json(revenue.reverse());
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top Customers API
app.get('/api/customers/top', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [topCustomers] = await connection.query(`
      SELECT c.customerNumber, c.customerName, c.country,
             SUM(p.amount) as totalSpent
      FROM customers c
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY c.customerNumber
      ORDER BY totalSpent DESC
      LIMIT 10
    `);
    
    connection.release();
    res.json(topCustomers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Product Lines API
app.get('/api/product-lines', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [productLines] = await connection.query(`
      SELECT pl.productLine, COUNT(p.productCode) as productCount,
             SUM(p.quantityInStock) as totalStock
      FROM productlines pl
      LEFT JOIN products p ON pl.productLine = p.productLine
      GROUP BY pl.productLine
    `);
    
    connection.release();
    res.json(productLines);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Employees API
app.get('/api/employees', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [employees] = await connection.query(`
      SELECT e.employeeNumber, e.firstName, e.lastName, e.jobTitle, e.reportsTo,
             o.officeCode, o.city, o.country,
             COUNT(c.customerNumber) as customersManaged
      FROM employees e
      LEFT JOIN offices o ON e.officeCode = o.officeCode
      LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
      GROUP BY e.employeeNumber
      ORDER BY e.firstName
    `);
    
    connection.release();
    res.json(employees);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Offices API
app.get('/api/offices', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [offices] = await connection.query(`
      SELECT o.officeCode, o.city, o.country, o.postalCode, o.phone,
             COUNT(e.employeeNumber) as employeeCount,
             COUNT(DISTINCT c.customerNumber) as customerCount
      FROM offices o
      LEFT JOIN employees e ON o.officeCode = e.officeCode
      LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
      GROUP BY o.officeCode
      ORDER BY o.country, o.city
    `);
    
    connection.release();
    res.json(offices);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Advanced Dashboard Overview
app.get('/api/dashboard/overview', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Total Employees
    const [employeesCount] = await connection.query('SELECT COUNT(*) as count FROM employees');
    
    // Total Offices
    const [officesCount] = await connection.query('SELECT COUNT(*) as count FROM offices');
    
    // Average Order Value
    const [avgOrder] = await connection.query(`
      SELECT AVG(total) as avgValue FROM (
        SELECT SUM(od.quantityOrdered * od.priceEach) as total
        FROM orders o
        LEFT JOIN orderdetails od ON o.orderNumber = od.orderNumber
        GROUP BY o.orderNumber
      ) as order_totals
    `);
    
    // Top Performing Offices
    const [topOffices] = await connection.query(`
      SELECT o.city, o.country, COUNT(DISTINCT c.customerNumber) as customers,
             COALESCE(SUM(p.amount), 0) as revenue
      FROM offices o
      LEFT JOIN employees e ON o.officeCode = e.officeCode
      LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY o.officeCode
      ORDER BY revenue DESC
      LIMIT 5
    `);
    
    // Sales by Region (Country)
    const [regionSales] = await connection.query(`
      SELECT o.country as region, COUNT(DISTINCT c.customerNumber) as customers,
             COUNT(DISTINCT o2.orderNumber) as orders,
             COALESCE(SUM(p.amount), 0) as revenue
      FROM offices o
      LEFT JOIN employees e ON o.officeCode = e.officeCode
      LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
      LEFT JOIN orders o2 ON c.customerNumber = o2.customerNumber
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY o.country
      ORDER BY revenue DESC
    `);
    
    // Product Performance
    const [productPerformance] = await connection.query(`
      SELECT p.productName, p.productLine,
             COUNT(od.orderNumber) as timesSold,
             SUM(od.quantityOrdered) as totalQuantity,
             SUM(od.quantityOrdered * od.priceEach) as totalRevenue
      FROM products p
      LEFT JOIN orderdetails od ON p.productCode = od.productCode
      GROUP BY p.productCode
      ORDER BY totalRevenue DESC
      LIMIT 10
    `);
    
    // Employee Performance
    const [employeePerformance] = await connection.query(`
      SELECT CONCAT(e.firstName, ' ', e.lastName) as name, e.jobTitle,
             COUNT(DISTINCT c.customerNumber) as customers,
             COUNT(DISTINCT o.orderNumber) as orders,
             COALESCE(SUM(p.amount), 0) as revenue
      FROM employees e
      LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
      LEFT JOIN orders o ON c.customerNumber = o.customerNumber
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY e.employeeNumber
      ORDER BY revenue DESC
      LIMIT 10
    `);
    
    connection.release();
    
    res.json({
      totalEmployees: employeesCount[0].count,
      totalOffices: officesCount[0].count,
      avgOrderValue: parseFloat(avgOrder[0]?.avgValue || 0).toFixed(2),
      topOffices,
      regionSales,
      productPerformance,
      employeePerformance
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Performance by Employee
app.get('/api/employees/performance', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [performance] = await connection.query(`
      SELECT CONCAT(e.firstName, ' ', e.lastName) as name, e.jobTitle, e.employeeNumber,
             COUNT(DISTINCT c.customerNumber) as customersCount,
             COUNT(DISTINCT o.orderNumber) as ordersCount,
             COALESCE(SUM(p.amount), 0) as totalRevenue
      FROM employees e
      LEFT JOIN customers c ON e.employeeNumber = c.salesRepEmployeeNumber
      LEFT JOIN orders o ON c.customerNumber = o.customerNumber
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY e.employeeNumber
      ORDER BY totalRevenue DESC
    `);
    
    connection.release();
    res.json(performance);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sales by Country/Region
app.get('/api/sales/by-region', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [sales] = await connection.query(`
      SELECT c.country, COUNT(DISTINCT c.customerNumber) as customers,
             COUNT(DISTINCT o.orderNumber) as orders,
             COALESCE(SUM(p.amount), 0) as revenue
      FROM customers c
      LEFT JOIN orders o ON c.customerNumber = o.customerNumber
      LEFT JOIN payments p ON c.customerNumber = p.customerNumber
      GROUP BY c.country
      ORDER BY revenue DESC
    `);
    
    connection.release();
    res.json(sales);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inventory Analysis
app.get('/api/inventory/analysis', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [inventory] = await connection.query(`
      SELECT p.productLine, COUNT(p.productCode) as productCount,
             SUM(p.quantityInStock) as totalQuantity,
             AVG(p.quantityInStock) as avgQuantity,
             SUM(p.quantityInStock * p.buyPrice) as totalValue
      FROM products p
      GROUP BY p.productLine
      ORDER BY totalValue DESC
    `);
    
    connection.release();
    res.json(inventory);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Orders with date filtering
app.get('/api/orders/recent', async (req, res) => {
  try {
    const { limit = 1000 } = req.query;
    let query = `
      SELECT o.orderNumber,
             o.orderDate,
             o.requiredDate,
             o.shippedDate,
             o.status,
             o.comments,
             c.customerName,
             COALESCE((SELECT SUM(od.quantityOrdered * od.priceEach) FROM orderdetails od WHERE od.orderNumber = o.orderNumber), 0) as total
      FROM orders o
      JOIN customers c ON o.customerNumber = c.customerNumber
      ORDER BY o.orderDate DESC
      LIMIT ?
    `;
    
    const connection = await pool.getConnection();
    const [orders] = await connection.query(query, [parseInt(limit)]);
    connection.release();
    res.json(orders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order Analytics with date filtering
app.get('/api/orders/analytics', async (req, res) => {
  try {
    const { limit = 10000 } = req.query;
    const query = `
      SELECT 
        COUNT(DISTINCT o.orderNumber) as totalOrders,
        SUM(CASE WHEN o.status = 'Shipped' THEN 1 ELSE 0 END) as shippedOrders,
        SUM(CASE WHEN o.status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
        SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
        ROUND(AVG(CASE WHEN o.shippedDate IS NOT NULL THEN DATEDIFF(o.shippedDate, o.orderDate) ELSE NULL END), 2) as avgFulfillmentTime
      FROM (
        SELECT o.* FROM orders o ORDER BY o.orderDate DESC LIMIT ?
      ) o
    `;
    
    const connection = await pool.getConnection();
    const [results] = await connection.query(query, [parseInt(limit)]);
    connection.release();
    res.json(results[0] || {});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
