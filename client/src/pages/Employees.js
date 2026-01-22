import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, Users, Award } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTitle, setFilterTitle] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, perfRes] = await Promise.all([
          axios.get('/api/employees'),
          axios.get('/api/employees/performance')
        ]);
        setEmployees(empRes.data || []);
        setPerformance(perfRes.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employee data');
        setEmployees([]);
        setPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTitle = filterTitle === 'all' || emp.jobTitle === filterTitle;
    return matchesSearch && matchesTitle;
  });

  const titles = [...new Set(employees.map(e => e.jobTitle))];

  // Performance Chart
  const performanceChartData = {
    labels: performance.slice(0, 10).map(p => p.name.split(' ')[0]),
    datasets: [{
      label: 'Revenue Generated',
      data: performance.slice(0, 10).map(p => parseFloat(p.totalRevenue || 0)),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Employees</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100">Employees</h1>
          <p className="text-gray-400 mt-2">Manage and monitor employee performance</p>
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Top Employee Performance</h2>
          <div style={{ position: 'relative', height: '300px' }}>
            <Bar data={performanceChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, labels: { color: '#d1d5db' } },
              }
            }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Employees</p>
                <p className="text-3xl font-bold text-gray-100">{employees.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Roles</p>
                <p className="text-3xl font-bold text-gray-100">{titles.length}</p>
              </div>
              <Award className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Revenue/Employee</p>
                <p className="text-3xl font-bold text-green-400">
                  ${(performance.reduce((sum, p) => sum + parseFloat(p.totalRevenue || 0), 0) / performance.length).toFixed(0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Search by Name</label>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Filter by Title</label>
              <select
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Titles</option>
                {titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-200">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-200">Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-200">Location</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-200">Customers</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-200">Orders</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-200">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const empPerf = performance.find(p => p.employeeNumber === emp.employeeNumber) || {};
                  return (
                    <tr key={emp.employeeNumber} className="border-b border-slate-700 hover:bg-slate-700 transition">
                      <td className="px-6 py-3 font-medium text-gray-200">{emp.firstName} {emp.lastName}</td>
                      <td className="px-6 py-3 text-gray-400">{emp.jobTitle}</td>
                      <td className="px-6 py-3 text-gray-400">{emp.city}, {emp.country}</td>
                      <td className="px-6 py-3 text-center text-gray-400">{empPerf.customersCount || 0}</td>
                      <td className="px-6 py-3 text-center text-gray-400">{empPerf.ordersCount || 0}</td>
                      <td className="px-6 py-3 text-right font-semibold text-green-400">
                        ${parseFloat(empPerf.totalRevenue || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
