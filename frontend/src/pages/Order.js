import React, { useState } from 'react';
import './Order.css'; // Add this file for styling

function Orders() {
  // State for existing orders (to be fetched from the backend in a real-world scenario)
  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: 'John Doe',
      medicine: 'Paracetamol',
      quantity: 3,
      totalPrice: 15.0,
      status: 'Pending',
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      medicine: 'Amoxicillin',
      quantity: 2,
      totalPrice: 20.0,
      status: 'Completed',
    },
  ]);

  // State for new order form
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    medicine: '',
    quantity: 1,
  });

  // Handle input changes for the new order
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value,
    });
  };

  // Handle adding a new order
  const handleAddOrder = () => {
    const newOrderId = orders.length + 1;
    const newTotalPrice = newOrder.quantity * 5; // Assume $5 per unit for simplicity
    const order = {
      ...newOrder,
      id: newOrderId,
      totalPrice: newTotalPrice,
      status: 'Pending',
    };

    setOrders([...orders, order]);
    setNewOrder({
      customerName: '',
      medicine: '',
      quantity: 1,
    });
  };

  // Example of status management (Pending, Completed, Canceled)
  const updateOrderStatus = (id, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
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
