import React, { useState } from 'react';
import './AddMedicine.css';

function AddMedicine() {
  const [medicine, setMedicine] = useState({
    name: '',
    price: '',
    stock: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicine({ ...medicine, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Submit the form data to the backend (for example, via an API)
    console.log('New Medicine:', medicine);

    // Reset the form fields after submission
    setMedicine({
      name: '',
      price: '',
      stock: '',
    });
  };

  return (
    <div className="add-medicine-container">
      <h2>Add New Medicine</h2>
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
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={medicine.price}
            onChange={handleInputChange}
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
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Medicine</button>
      </form>
    </div>
  );
}

export default AddMedicine;
