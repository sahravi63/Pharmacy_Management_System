// SignUp.js
import React, { useState } from 'react';
import './signUp.css'; // Assuming custom CSS for styling
import axios from 'axios'; // For API requests

function SignUp() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer', // Default role is customer
  });

  const [pharmacistID, setPharmacistID] = useState(null);
  const [showPharmacistID, setShowPharmacistID] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', user); // Update the URL here

  
      if (response.data.role === 'pharmacist') {
        setPharmacistID(response.data.pharmacistID); // Receive pharmacistID from backend
        setShowPharmacistID(true);
        setMessage('Pharmacist registered successfully!');
      } else {
        setMessage('Customer registered successfully!');
      }
  
      // Reset form after successful registration
      setUser({
        name: '',
        email: '',
        password: '',
        role: 'customer',
      });
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Error registering user. Please try again.');
    }
  };
  

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
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
            {/* Later, an Admin role can be added here */}
          </select>
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>
      </form>

      {message && <p className="message">{message}</p>}

      {showPharmacistID && (
        <div className="pharmacist-id-container">
          <p>Your Pharmacist ID for login access:</p>
          <strong>{pharmacistID}</strong>
        </div>
      )}
    </div>
  );
}

export default SignUp;
