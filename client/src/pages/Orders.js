import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders/recent?limit=50000');
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Shipped': return 'bg-green-100 text-green-800';
      case 'In Process': return 'bg-blue-100 text-blue-800';
      case 'Disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Order metrics
  const totalOrderValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrderValue / orders.length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const inProcessOrders = orders.filter(o => o.status === 'In Process').length;
  const disputedOrders = orders.filter(o => o.status === 'Disputed').length;

  // Status distribution
  const statusData = {
    labels: ['Shipped', 'In Process', 'Disputed'],
    datasets: [{
      data: [shippedOrders, inProcessOrders, disputedOrders],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderColor: ['rgb(34, 197, 94)', 'rgb(59, 130, 246)', 'rgb(239, 68, 68)'],
      borderWidth: 2,
    }]
  };

  // Order values over time - show by week if only one month, else by month
  const uniqueMonths = new Set(orders.map(order => {
    const date = new Date(order.orderDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }));

  let monthlyOrderData;
  
  if (uniqueMonths.size <= 1) {
    // Show by day if only one month
    const ordersByDay = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      ordersByDay[dayKey] = (ordersByDay[dayKey] || 0) + 1;
    });

    const sortedDays = Object.keys(ordersByDay).sort();
    monthlyOrderData = {
      labels: sortedDays.map(d => {
        const [year, month, day] = d.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Orders per Day',
        data: sortedDays.map(d => ordersByDay[d]),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
      }]
    };
  } else {
    // Show by month if multiple months
    const ordersByMonth = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      ordersByMonth[monthKey] = (ordersByMonth[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(ordersByMonth).sort();
    monthlyOrderData = {
      labels: sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }),
      datasets: [{
        label: 'Orders per Month',
        data: sortedMonths.map(m => ordersByMonth[m]),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
      }]
    };
  }

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
        <h1 className="text-4xl font-bold text-gray-100">Orders</h1>
        <p className="text-gray-400 mt-2">Advanced order analytics and tracking</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{orders.length}</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Shipped Orders</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{shippedOrders}</p>
          <p className="text-xs text-gray-500 mt-2">{((shippedOrders / orders.length) * 100).toFixed(0)}% of total</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">In Process</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{inProcessOrders}</p>
          <p className="text-xs text-gray-500 mt-2">{((inProcessOrders / orders.length) * 100).toFixed(0)}% of total</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <p className="text-gray-400 text-sm font-medium">Disputed Orders</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{disputedOrders}</p>
          <p className="text-xs text-gray-500 mt-2">{((disputedOrders / orders.length) * 100).toFixed(0)}% of total</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Order Status Distribution</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={statusData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {...chartOptions.plugins.legend, position: 'bottom', labels: {color: '#d1d5db'}}}}} />
          </div>
        </div>

        {/* Orders Over Time */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Orders Over Time</h2>
          <div style={{ height: '300px' }}>
            <Line data={monthlyOrderData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-700">
          <h2 className="text-lg font-bold text-gray-100">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Order #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 text-blue-400 font-bold">#{order.orderNumber}</td>
                  <td className="px-6 py-4 text-gray-200">{order.customerName}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-green-400 font-bold">${parseFloat(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
