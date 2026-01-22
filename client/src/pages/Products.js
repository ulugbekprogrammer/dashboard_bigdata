import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Search } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, invRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/inventory/analysis`)
        ]);
        setProducts(prodRes.data || []);
        setInventory(invRes.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load product data');
        setProducts([]);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = products.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Products</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Top products by orders
  const topByOrders = [...products].sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0)).slice(0, 8);
  const topOrdersChartData = {
    labels: topByOrders.map(p => p.productName.substring(0, 12) + (p.productName.length > 12 ? '...' : '')),
    datasets: [{
      label: 'Order Count',
      data: topByOrders.map(p => p.orderCount || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
    }]
  };

  // Products by line
  const productLines = {};
  products.forEach(p => {
    productLines[p.productLine] = (productLines[p.productLine] || 0) + 1;
  });

  const lineChartData = {
    labels: Object.keys(productLines),
    datasets: [{
      data: Object.values(productLines),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(244, 63, 94, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)',
        'rgb(14, 165, 233)',
        'rgb(249, 115, 22)',
        'rgb(244, 63, 94)',
      ],
      borderWidth: 2,
    }]
  };

  // Stock levels
  const lowStock = products.filter(p => p.quantityInStock <= 50).length;
  const mediumStock = products.filter(p => p.quantityInStock > 50 && p.quantityInStock <= 100).length;
  const highStock = products.filter(p => p.quantityInStock > 100).length;

  const stockChartData = {
    labels: ['Low Stock (≤50)', 'Medium Stock (51-100)', 'High Stock (>100)'],
    datasets: [{
      data: [lowStock, mediumStock, highStock],
      backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(34, 197, 94, 0.8)'],
      borderColor: ['rgb(239, 68, 68)', 'rgb(234, 179, 8)', 'rgb(34, 197, 94)'],
      borderWidth: 2,
    }]
  };

  // Calculate totals from products
  const totalInventoryValue = products.reduce((sum, p) => sum + (parseFloat(p.quantityInStock || 0) * parseFloat(p.buyPrice || 0)), 0);
  const totalUnitsInStock = products.reduce((sum, p) => sum + (p.quantityInStock || 0), 0);
  const avgStockPerLine = Object.keys(productLines).length > 0 ? totalUnitsInStock / Object.keys(productLines).length : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 12 },
          padding: 15,
          color: '#d1d5db',
          usePointStyle: true,
          maxWidth: 200,
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: '#e5e7eb',
        bodyColor: '#d1d5db',
        borderColor: '#475569',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        }
      },
      x: {
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        }
      }
    }
  };

  return (
    <div className="flex-1 bg-slate-900 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-100">Products</h1>
        <p className="text-gray-400 mt-2">Complete product analytics and inventory management</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{products.length}</p>
          <p className="text-xs text-gray-500 mt-2">In catalog</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Product Lines</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{Object.keys(productLines).length}</p>
          <p className="text-xs text-gray-500 mt-2">Categories</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Total Stock</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{products.reduce((sum, p) => sum + (p.quantityInStock || 0), 0)}</p>
          <p className="text-xs text-gray-500 mt-2">Units in inventory</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{lowStock}</p>
          <p className="text-xs text-gray-500 mt-2">Need reorder</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Products by Orders */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Top 8 Products by Orders</h2>
          <div style={{ height: '300px' }}>
            <Bar data={topOrdersChartData} options={chartOptions} />
          </div>
        </div>

        {/* Stock Level Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Stock Level Distribution</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={stockChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {...chartOptions.plugins.legend, position: 'bottom', labels: {color: '#d1d5db'}}}}} />
          </div>
        </div>

        {/* Price Range Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Price Range Distribution</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={{
              labels: ['Budget (<$50)', 'Mid ($50-$100)', 'Premium (>$100)'],
              datasets: [{
                data: [
                  products.filter(p => parseFloat(p.MSRP || 0) < 50).length,
                  products.filter(p => parseFloat(p.MSRP || 0) >= 50 && parseFloat(p.MSRP || 0) <= 100).length,
                  products.filter(p => parseFloat(p.MSRP || 0) > 100).length,
                ],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(168, 85, 247, 0.8)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(168, 85, 247)'],
                borderWidth: 2,
              }]
            }} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {...chartOptions.plugins.legend, position: 'bottom', labels: {color: '#d1d5db'}}}}} />
          </div>
        </div>
      </div>

      {/* Inventory Analysis by Product Line */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Inventory Analysis by Product Line</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-200">Product Line</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-200">Products</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-200">Total Stock</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-200">Avg Stock/Product</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-200">Inventory Value</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((line, idx) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                  <td className="px-6 py-3 font-medium text-gray-200">{line.productLine}</td>
                  <td className="px-6 py-3 text-center text-gray-400">{line.productCount}</td>
                  <td className="px-6 py-3 text-center font-semibold text-blue-400">{line.totalQuantity}</td>
                  <td className="px-6 py-3 text-center text-gray-400">
                    {(line.totalQuantity / line.productCount).toFixed(0)}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-green-400">
                    ${parseFloat(line.totalValue || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Inventory Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-400 text-sm">Total Inventory Value</p>
            <p className="text-2xl font-bold text-blue-400">
              ${totalInventoryValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-gray-400 text-sm">Total Units in Stock</p>
            <p className="text-2xl font-bold text-purple-400">
              {totalUnitsInStock.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-orange-500">
            <p className="text-gray-400 text-sm">Average Stock per Line</p>
            <p className="text-2xl font-bold text-orange-400">
              {avgStockPerLine.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Product Lines Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Products by Line</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ height: '300px' }}>
            <Doughnut data={lineChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {...chartOptions.plugins.legend, position: 'bottom', labels: {color: '#d1d5db'}}}}} />
          </div>
          <div className="flex flex-col justify-center">
            <div className="space-y-3">
              {Object.entries(productLines).sort((a, b) => b[1] - a[1]).map(([line, count], idx) => {
                const percentage = ((count / products.length) * 100).toFixed(1);
                const colors = [
                  { bg: 'bg-blue-500', text: 'text-blue-400' },
                  { bg: 'bg-green-500', text: 'text-green-400' },
                  { bg: 'bg-yellow-500', text: 'text-yellow-400' },
                  { bg: 'bg-purple-500', text: 'text-purple-400' },
                  { bg: 'bg-red-500', text: 'text-red-400' },
                  { bg: 'bg-cyan-500', text: 'text-cyan-400' },
                  { bg: 'bg-orange-500', text: 'text-orange-400' },
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={line} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                      <span className="text-gray-200 text-sm font-medium">{line}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${color.text}`}>{count}</span>
                      <span className="text-gray-400 text-sm w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-700">
          <h2 className="text-lg font-bold text-gray-100">Product Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Product Line</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Buy Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">MSRP</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Orders</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 text-gray-200 font-medium">{product.productName}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{product.productLine}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.quantityInStock > 100 
                        ? 'bg-green-900 text-green-200'
                        : product.quantityInStock > 50
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {product.quantityInStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-200">${parseFloat(product.buyPrice || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-200 font-bold">${parseFloat(product.MSRP || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-blue-400 font-medium">{product.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
