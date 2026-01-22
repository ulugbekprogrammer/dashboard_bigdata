import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import Employees from './pages/Employees';
import Offices from './pages/Offices';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Products from './pages/Products';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'overview':
        return <Overview />;
      case 'employees':
        return <Employees />;
      case 'offices':
        return <Offices />;
      case 'customers':
        return <Customers />;
      case 'orders':
        return <Orders />;
      case 'products':
        return <Products />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
}

export default App;
