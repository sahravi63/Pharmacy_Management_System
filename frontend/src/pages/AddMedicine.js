import React, { useState } from 'react';
import './AddMedicine.css';
import axios from 'axios';

function AddMedicine() {
  const [medicine, setMedicine] = useState({
    name: '',
    description: '', // Add description field
    price: '',
    stock: '',
    expiryDate: '', // Add expiryDate to the form state
  });

  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicine({ ...medicine, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/medicines/add', medicine); // Ensure the backend is listening on this endpoint
      setMessage(response.data.message);
      setMedicine({
        name: '',
        description: '', // Reset description after submission
        price: '',
        stock: '',
        expiryDate: '', // Reset expiryDate after submission
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      setMessage('Error adding medicine');
    }
  };

  return (
    <div className="add-medicine-container">
      <h2>Add New Medicine</h2>
      {message && <p className={message.includes('Error') ? 'error' : 'success'}>{message}</p>} {/* Show success/error message */}
      <form onSubmit={handleSubmit} className="add-medicine-form">
        <div className="form-group">
          <label htmlFor="name">Medicine Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={medicine.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={medicine.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={medicine.price}
            onChange={handleInputChange}
            step="0.01" // Allows two decimal places for price
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={medicine.stock}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date:</label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={medicine.expiryDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Medicine</button>
      </form>
    </div>
  );
}

export default AddMedicine;
