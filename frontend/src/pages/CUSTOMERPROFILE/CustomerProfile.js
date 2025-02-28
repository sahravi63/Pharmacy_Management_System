import React, { useState, useEffect } from 'react';
import './CustomerProfile.css'; // Assuming custom CSS styles

function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch customer details
    const fetchCustomerDetails = async () => {
      try {
        const profileResponse = await fetch('http://localhost:5000/api/customer/profile');
        const profileData = await profileResponse.json();
        setCustomer(profileData);

        const ordersResponse = await fetch('http://localhost:5000/api/customer/orders');
        const ordersData = await ordersResponse.json();
        setOrderHistory(ordersData);
      } catch (err) {
        setError('Failed to fetch customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, []);

  if (loading) {
    return <div className="loading">Loading customer data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!customer) {
    return <div>No customer data available.</div>;
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
        <button className="edit-profile-btn" onClick={() => alert('Edit Profile feature coming soon!')}>
          Edit Profile
        </button>
        <button className="change-password-btn" onClick={() => alert('Change Password feature coming soon!')}>
          Change Password
        </button>
      </div>
    </div>
  );
}

export default CustomerProfile;
