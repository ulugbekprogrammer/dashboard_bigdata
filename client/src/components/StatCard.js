import React from 'react';

export default function StatCard({ title, value, color }) {
  const formatValue = () => {
    if (value === undefined || value === null) {
      return '0';
    }
    
    // If it's already a string, return it as is
    if (typeof value === 'string') {
      return value;
    }
    
    // If it's a number, format it
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return String(value);
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-100 mt-2">
            {formatValue()}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
        </div>
      </div>
    </div>
  );
}