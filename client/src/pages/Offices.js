import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Building2, Users, PhoneIcon, MapPin } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Offices() {
  const [offices, setOffices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [officesRes, regionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/offices`),
          axios.get(`${API_BASE_URL}/api/sales/by-region`)
        ]);
        setOffices(officesRes.data || []);
        setRegions(regionsRes.data || []);
        if (officesRes.data && officesRes.data.length > 0) {
          setSelectedOffice(officesRes.data[0]);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching offices:', error);
        setError('Failed to load office data');
        setOffices([]);
        setRegions([]);
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Offices</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Chart data for office comparison
  const employeeChartData = {
    labels: offices.map(o => o.city),
    datasets: [{
      label: 'Employees',
      data: offices.map(o => o.employeeCount),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
    }]
  };

  // Customer distribution by region
  const customerChartData = {
    labels: regions.map(r => r.country),
    datasets: [{
      data: regions.map(r => r.customers),
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

  return (
    <div className="flex-1 overflow-auto bg-slate-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100">Offices & Locations</h1>
          <p className="text-gray-400 mt-2">Global office network and regional performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Offices</p>
                <p className="text-3xl font-bold text-gray-100">{offices.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Employees</p>
                <p className="text-3xl font-bold text-gray-100">
                  {offices.reduce((sum, o) => sum + o.employeeCount, 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Regions Active</p>
                <p className="text-3xl font-bold text-gray-100">{regions.length}</p>
              </div>
              <MapPin className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Employees by Office */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Employees per Office</h2>
            <div style={{ position: 'relative', height: '300px' }}>
              <Bar data={employeeChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false, labels: { color: '#d1d5db' } } }
              }} />
            </div>
          </div>

          {/* Customers by Region */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Customers by Region</h2>
            <div style={{ position: 'relative', height: '300px' }}>
              <Pie data={customerChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom', labels: { color: '#d1d5db' } } }
              }} />
            </div>
          </div>
        </div>

        {/* Offices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {offices.map((office) => (
            <div
              key={office.officeCode}
              onClick={() => setSelectedOffice(office)}
              className={`p-6 rounded-lg shadow-md cursor-pointer transition transform hover:shadow-xl border ${
                selectedOffice?.officeCode === office.officeCode
                  ? 'bg-slate-700 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:scale-105'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-100">{office.city}</h3>
                  <p className="text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {office.country}, {office.postalCode}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500 opacity-30" />
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="flex items-center gap-2 text-gray-300">
                  <PhoneIcon className="w-4 h-4" />
                  {office.phone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-gray-400 text-sm">Employees</p>
                  <p className="text-2xl font-bold text-blue-400">{office.employeeCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Customers</p>
                  <p className="text-2xl font-bold text-green-400">{office.customerCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Regional Performance Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-gray-100">Regional Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-200">Region/Country</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-200">Customers</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-200">Orders</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-200">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                    <td className="px-6 py-3 font-medium text-gray-200">{region.country}</td>
                    <td className="px-6 py-3 text-center text-gray-400">{region.customers}</td>
                    <td className="px-6 py-3 text-center text-gray-400">{region.orders}</td>
                    <td className="px-6 py-3 text-right font-semibold text-green-400">
                      ${parseFloat(region.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
