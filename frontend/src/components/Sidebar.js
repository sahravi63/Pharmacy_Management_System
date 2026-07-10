import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user }) {
  const canManage = ['admin', 'pharmacist'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="sidebar">
      <nav>
        
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          {canManage && <li><Link to="/add-medicine">Add Medicine</Link></li>}
          <li><Link to="/inventory">View Inventory</Link></li>
          <li><Link to="/orders">Orders</Link></li>
          {canManage && <li><Link to="/sales-report">Sales Report</Link></li>}
          {isAdmin && <li><Link to="/inventory">Manage Inventory</Link></li>}
          <li><Link to="/customer-profile">Customer Profile</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
