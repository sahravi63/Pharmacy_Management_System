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
  const [showPharmacistID, setShowPharmacistID] = useState(false); // To toggle ID visibility
  const [message, setMessage] = useState(''); // Message display

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', user);

      // Log the response for debugging
      console.log('Signup Response:', response.data);

      // Check if pharmacistID exists in the response (pharmacist registration)
      if (response.data.pharmacistID) {
        setPharmacistID(response.data.pharmacistID); // Set Pharmacist ID
        setShowPharmacistID(true); // Show Pharmacist ID section
        setMessage('Pharmacist registered successfully! Here is your Pharmacist ID.');
      } else {
        // Customer registration
        setMessage('Customer registered successfully!');
      }
  
      // Reset form after successful registration
      setUser({
        name: '',
        email: '',
        password: '',
        role: 'customer', // Reset back to customer
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
      {message && <p className="message">{message}</p>}

      {/* Pharmacist ID Display */}
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
