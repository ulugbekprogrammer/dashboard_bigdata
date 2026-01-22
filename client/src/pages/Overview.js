import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Bar, Line } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import { Users, Building2, Globe, DollarSign } from 'lucide-react';

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/overview`);
        setData(res.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        setError('Failed to load overview data. Please check your connection.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  // Safely access data with defaults
  const regionSales = data.regionSales || [];
  const productPerformance = data.productPerformance || [];
  const topOffices = data.topOffices || [];
  const employeePerformance = data.employeePerformance || [];

  // Region Sales Chart
  const regionChartData = {
    labels: regionSales.map(r => r.region),
    datasets: [{
      label: 'Revenue by Region',
      data: regionSales.map(r => parseFloat(r.revenue || 0)),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 75, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 75, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
      ],
      borderWidth: 2,
    }]
  };

  // Top Products Chart
  const productChartData = {
    labels: productPerformance.map(p => p.productName.substring(0, 20) + '...'),
    datasets: [{
      label: 'Product Revenue',
      data: productPerformance.map(p => parseFloat(p.totalRevenue || 0)),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
    }]
  };

  // Top Offices Chart
  const officeChartData = {
    labels: topOffices.map(o => `${o.city}, ${o.country}`),
    datasets: [{
      label: 'Revenue',
      data: topOffices.map(o => parseFloat(o.revenue || 0)),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
    }]
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100">Business Overview</h1>
          <p className="text-gray-400 mt-2">Comprehensive analysis across all regions and departments</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Employees"
            value={data.totalEmployees}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Offices"
            value={data.totalOffices}
            icon={Building2}
            color="bg-purple-500"
          />
          <StatCard
            title="Avg Order Value"
            value={`$${parseFloat(data.avgOrderValue).toFixed(2)}`}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Regions Active"
            value={regionSales.length}
            icon={Globe}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Region */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Revenue by Region</h2>
            <div style={{ position: 'relative', height: '300px' }}>
              <Bar data={regionChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false, labels: { color: '#d1d5db' } } }
              }} />
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Top 10 Products by Revenue</h2>
            <div style={{ position: 'relative', height: '300px' }}>
              <Bar data={productChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false, labels: { color: '#d1d5db' } } }
              }} />
            </div>
          </div>
        </div>

        {/* Top Offices Trend */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Top Performing Offices</h2>
          <div style={{ position: 'relative', height: '300px' }}>
            <Line data={officeChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: true, labels: { color: '#d1d5db' } } }
            }} />
          </div>
        </div>

        {/* Employee Performance Table */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Top Employee Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-200">Employee Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-200">Title</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-200">Customers</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-200">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map((emp, idx) => (
                  <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700">
                    <td className="px-4 py-3 font-medium text-gray-200">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-400">{emp.jobTitle}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{emp.customers}</td>
                    <td className="px-4 py-3 text-center font-semibold text-green-400">
                      ${parseFloat(emp.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Region Details */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Regional Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regionSales.map((region, idx) => (
              <div key={idx} className="border border-slate-700 rounded-lg p-4 bg-slate-700 hover:bg-slate-600 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-100">{region.region}</h3>
                    <p className="text-gray-400 text-sm">
                      {region.customers} customers • {region.orders} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">
                      ${parseFloat(region.revenue || 0).toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-xs">Total Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
