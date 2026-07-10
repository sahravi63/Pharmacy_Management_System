import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationsPanel from '../components/NotificationsPanel';
import './Dashboard.css';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalMedicines: 0,
    totalCustomers: 0,
    totalSalesAmount: 0,
    lowStockCount: 0,
    stockProgress: 0,
  });

  const [ordersToday, setOrdersToday] = useState(0); // Placeholder
  const [salesThisMonth, setSalesThisMonth] = useState(0); // Placeholder

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setDashboardData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchDashboardData();

    // You can set these if you add endpoints for ordersToday and monthly sales
    setOrdersToday(15); // Replace with API call
    setSalesThisMonth(5000); // Replace with API call
  }, []);

  const {
    totalMedicines,
    totalCustomers,
    totalSalesAmount,
    lowStockCount,
    stockProgress,
  } = dashboardData;

  return (
    <div className="dashboard">
      <h1>Pharmacy Management Dashboard</h1>
      <NotificationsPanel user={{ role: 'admin' }} />
      <div className="dashboard-overview">
        <div className="card">
          <h3>Total Medicines</h3>
          <p>{totalMedicines}</p>
        </div>
        <div className="card">
          <h3>Low Stock (&le;10)</h3>
          <p>{lowStockCount}</p>
        </div>
        <div className="card">
          <h3>Total Customers</h3>
          <p>{totalCustomers}</p>
        </div>
        <div className="card">
          <h3>Total Sales</h3>
          <p>${totalSalesAmount.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Stock Health</h3>
          <p>{stockProgress}% OK</p>
        </div>
        <div className="card">
          <h3>Orders Today</h3>
          <p>{ordersToday}</p>
        </div>
        <div className="card">
          <h3>Sales This Month</h3>
          <p>${salesThisMonth}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
