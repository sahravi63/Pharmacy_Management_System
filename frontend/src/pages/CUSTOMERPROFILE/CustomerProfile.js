import React, { useState, useEffect } from 'react';
import './CustomerProfile.css';  // Assuming custom CSS styles

function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    // Fetch customer details (This would be fetched from backend API)
    fetch('http://localhost:5000/api/customer/profile')
      .then((response) => response.json())
      .then((data) => setCustomer(data));

    // Fetch customer's order history
    fetch('http://localhost:5000/api/customer/orders')
      .then((response) => response.json())
      .then((data) => setOrderHistory(data));
  }, []);

  if (!customer) {
    return <div>Loading...</div>; // Show loading while fetching customer data
  }

  return (
    <div className="customer-profile-container">
      <h2>Customer Profile</h2>
      
      <div className="profile-info">
        <h3>Profile Information</h3>
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address}</p>
      </div>

      <div className="order-history">
        <h3>Order History</h3>
        {orderHistory.length > 0 ? (
          <table className="order-history-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      <div className="account-settings">
        <h3>Account Settings</h3>
        <button className="edit-profile-btn">Edit Profile</button>
        <button className="change-password-btn">Change Password</button>
      </div>
    </div>
  );
}

export default CustomerProfile;
