import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Search } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/customers');
        setCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.customerName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Prepare Top Customers by Spending
  const topBySpending = [...customers].sort((a, b) => (b.totalPayment || 0) - (a.totalPayment || 0)).slice(0, 8);
  const spendingChartData = {
    labels: topBySpending.map(c => c.customerName.substring(0, 12) + (c.customerName.length > 12 ? '...' : '')),
    datasets: [{
      label: 'Total Spending ($)',
      data: topBySpending.map(c => parseFloat(c.totalPayment || 0)),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
    }]
  };

  // Prepare Top Customers by Order Count
  const topByOrders = [...customers].sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0)).slice(0, 8);
  const ordersChartData = {
    labels: topByOrders.map(c => c.customerName.substring(0, 12) + (c.customerName.length > 12 ? '...' : '')),
    datasets: [{
      label: 'Order Count',
      data: topByOrders.map(c => c.orderCount || 0),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2,
    }]
  };

  // Customer Distribution by Country
  const countryStats = customers.reduce((acc, c) => {
    acc[c.country] = (acc[c.country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryStats).sort((a, b) => b[1] - a[1]).slice(0, 6);
  
  const countryChartData = {
    labels: topCountries.map(c => c[0]),
    datasets: [{
      data: topCountries.map(c => c[1]),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(14, 165, 233, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)',
        'rgb(14, 165, 233)',
      ],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 12 },
          padding: 15,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        ticks: {
          font: { size: 11 }
        }
      }
    }
  };

  return (
    <div className="flex-1 bg-slate-900 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-100">Customers</h1>
        <p className="text-gray-400 mt-2">Comprehensive customer analytics and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Total Customers</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{customers.length}</p>
          <p className="text-xs text-gray-500 mt-2">All registered customers</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Average Order Value</p>
          <p className="text-3xl font-bold text-green-400 mt-2">${customers.length > 0 ? parseFloat(customers.reduce((sum, c) => sum + (parseFloat(c.totalPayment) || 0), 0) / customers.length).toFixed(2) : '0.00'}</p>
          <p className="text-xs text-gray-500 mt-2">Per customer</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Total Customer Spending</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">${parseFloat(customers.reduce((sum, c) => sum + (parseFloat(c.totalPayment) || 0), 0)).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">All time revenue</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Customers by Spending */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Top Customers by Spending</h2>
          <div style={{ height: '300px' }}>
            <Bar data={spendingChartData} options={{...chartOptions, scales: {y: {...chartOptions.scales.y, ticks: {...chartOptions.scales.y.ticks, callback: (value) => '$' + value.toFixed(0), color: '#d1d5db'}, grid: {...chartOptions.scales.y.grid, color: 'rgba(148, 163, 184, 0.1)'}}, x: {...chartOptions.scales.x, ticks: {color: '#d1d5db'}, grid: {color: 'rgba(148, 163, 184, 0.1)'}}}}} />
          </div>
        </div>

        {/* Top Customers by Order Count */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Top Customers by Order Count</h2>
          <div style={{ height: '300px' }}>
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Customers by Country */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Customers by Country</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={countryChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {...chartOptions.plugins.legend, position: 'bottom', labels: {color: '#d1d5db'}}}}} />
          </div>
        </div>

        {/* Country Distribution Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Country Statistics</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between border-b border-slate-700 pb-2 last:border-b-0">
                <span className="text-sm text-gray-300 font-medium">{country[0]}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: (country[1] / topCountries[0][1] * 100) + '%'}}></div>
                  </div>
                  <span className="text-sm font-bold text-blue-400 w-8 text-right">{country[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Customer Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">City</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Country</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Orders</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Total Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 text-gray-200">{customer.customerName}</td>
                  <td className="px-6 py-4 text-gray-400">{customer.city}</td>
                  <td className="px-6 py-4 text-gray-400">{customer.country}</td>
                  <td className="px-6 py-4 text-gray-200 font-medium">{customer.orderCount}</td>
                  <td className="px-6 py-4 text-green-400 font-bold">${parseFloat(customer.totalPayment || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
