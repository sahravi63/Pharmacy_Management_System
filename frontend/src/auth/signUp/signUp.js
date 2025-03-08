import React, { useState } from 'react';
import './signUp.css'; // Assuming custom CSS for styling
import axios from 'axios';

function SignUp() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer', // Default role is customer
  });

  const [pharmacistID, setPharmacistID] = useState(null); // For Pharmacist ID
  const [customerID, setCustomerID] = useState(null); // For Customer ID
  const [message, setMessage] = useState(''); // Message display
  const [error, setError] = useState(''); // Error display

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset message
    setError(''); // Reset error

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', user);

      // Check if pharmacistID exists in the response (pharmacist registration)
      if (response.data.pharmacistID) {
        setPharmacistID(response.data.pharmacistID); // Set Pharmacist ID
        setMessage('Pharmacist registered successfully! Here is your Pharmacist ID.');
      } 
      
      // Check if customerID exists in the response (customer registration)
      else if (response.data.customerID) {
        setCustomerID(response.data.customerID); // Set Customer ID
        setMessage('Customer registered successfully! Here is your Customer ID.');
      }

      // Reset form after successful registration
      setUser({
        name: '',
        email: '',
        password: '',
        role: 'customer', // Reset back to customer
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      setError('Error registering user. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        {/* Name Input */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Email Input */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Role Selector */}
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={user.role}
            onChange={handleInputChange}
          >
            <option value="customer">Customer</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>

      {/* Display message */}
      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      {/* Pharmacist ID Display */}
      {pharmacistID && (
        <div className="pharmacist-id-container">
          <p>Your Pharmacist ID for login access:</p>
          <strong>{pharmacistID}</strong>
        </div>
      )}

      {/* Customer ID Display */}
      {customerID && (
        <div className="customer-id-container">
          <p>Your Customer ID for login access:</p>
          <strong>{customerID}</strong>
        </div>
      )}
    </div>
  );
}

export default SignUp;
