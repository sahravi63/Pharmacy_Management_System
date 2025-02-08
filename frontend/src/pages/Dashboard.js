import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);
  const [salesThisMonth, setSalesThisMonth] = useState(0);

  useEffect(() => {
    setTotalMedicines(200); // Replace with actual API call
    setOrdersToday(15);
    setSalesThisMonth(5000);
  }, []);

  return (
    <div className="dashboard">
      <h1>Pharmacy Management Dashboard</h1>
      <div className="dashboard-overview">
        <div className="card">
          <h3>Total Medicines</h3>
          <p>{totalMedicines}</p>
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
