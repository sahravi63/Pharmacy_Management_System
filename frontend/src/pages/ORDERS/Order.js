import React, { useState, useEffect } from 'react';
import './Order.css'; // Add this file for styling
import api from '../../services/api';

function Orders({ user }) {
  // State for existing orders fetched from the backend
  const [orders, setOrders] = useState([]);
  const isCustomer = user?.role === 'customer';

  // State for new order form
  const [newOrder, setNewOrder] = useState({
    customerName: isCustomer ? user?.name || '' : '',
    medicine: '',
    quantity: 1,
  });

  // Fetch orders from the backend on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
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
    if (isCustomer && !newOrder.customerName) {
      setNewOrder((current) => ({ ...current, customerName: user?.name || '' }));
    }

    try {
      const order = {
        ...newOrder,
        customerName: isCustomer ? (newOrder.customerName || user?.name || '') : newOrder.customerName,
        status: 'Pending',
      };

      const response = await api.post('/orders', order);
      setOrders([...orders, response.data]);
      setNewOrder({
        customerName: isCustomer ? user?.name || '' : '',
        medicine: '',
        quantity: 1,
      });
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  // Function to update the status of an order
  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}`, { status: newStatus });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const canUpdateStatus = ['admin', 'pharmacist'].includes(user?.role);

  return (
    <div className="orders-container">
      <h2>Orders</h2>

      {/* New Order Form */}
      <div className="order-form">
        <h3>Place a New Order</h3>
        {!isCustomer && (
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
        )}
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
                {canUpdateStatus && order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="complete-btn"
                    >
                      Deliver
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {(!canUpdateStatus || order.status !== 'Pending') && <span>{order.status}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;
