import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'overview', label: 'Overview' },
    { id: 'employees', label: 'Employees' },
    { id: 'offices', label: 'Offices' },
    { id: 'customers', label: 'Customers' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' }
  ];

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 text-white w-64 h-screen shadow-lg">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">ClassicModels</h1>
        <p className="text-slate-400 text-sm">Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-colors border-l-4 ${
              activeTab === tab.id
                ? 'bg-slate-700 border-white text-white'
                : 'border-transparent hover:bg-slate-700 text-gray-300'
            }`}
          >
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
