import React, { useState, useEffect } from 'react';
import './Order.css'; // Add this file for styling
import axios from 'axios'; // Install axios for HTTP requests

function Orders() {
  // State for existing orders fetched from the backend
  const [orders, setOrders] = useState([]);

  // State for new order form
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    medicine: '',
    quantity: 1,
  });

  // Fetch orders from the backend on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders'); // Adjust your API route if needed
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Handle input changes for the new order
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value,
    });
  };

  // Handle adding a new order
  const handleAddOrder = async () => {
    try {
      const newTotalPrice = newOrder.quantity * 5; // Assume $5 per unit for simplicity
      const order = {
        ...newOrder,
        totalPrice: newTotalPrice,
        status: 'Pending',
      };

      // Send a POST request to the backend to save the new order
      const response = await axios.post('http://localhost:5000/api/orders', order); // Adjust your API route
      setOrders([...orders, response.data]); // Add the new order to the state
      setNewOrder({
        customerName: '',
        medicine: '',
        quantity: 1,
      });
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  // Function to update the status of an order
  const updateOrderStatus = async (id, newStatus) => {
    console.log(`Updating order with ID: ${id} to status: ${newStatus}`); // Debugging log

    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, { status: newStatus }); // Send status update to the backend

      // After updating the status, fetch the updated orders from the backend
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="orders-container">
      <h2>Orders</h2>

      {/* New Order Form */}
      <div className="order-form">
        <h3>Place a New Order</h3>
        <label>
          Customer Name:
          <input
            type="text"
            name="customerName"
            value={newOrder.customerName}
            onChange={handleChange}
            placeholder="Enter customer name"
          />
        </label>
        <label>
          Medicine:
          <input
            type="text"
            name="medicine"
            value={newOrder.medicine}
            onChange={handleChange}
            placeholder="Enter medicine name"
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={newOrder.quantity}
            onChange={handleChange}
            min="1"
          />
        </label>
        <button onClick={handleAddOrder} className="add-order-btn">
          Add Order
        </button>
      </div>

      {/* Orders Table */}
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Medicine</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName}</td>
              <td>{order.medicine}</td>
              <td>{order.quantity}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Completed')}
                      className="complete-btn"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Canceled')}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'Completed' && <span>Completed</span>}
                {order.status === 'Canceled' && <span>Canceled</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;
