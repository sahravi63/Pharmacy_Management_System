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

  const [userID, setUserID] = useState(null); // Store Pharmacist/Customer ID
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

      // Extract user data
      const { pharmacistID, customerID } = response.data.user || {};
      const generatedID = pharmacistID || customerID;

      if (generatedID) {
        setUserID(generatedID);
        setMessage(`Registration successful! Your ID for login: ${generatedID}`);
      } else {
        setMessage('Registration successful!');
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
      setError(error.response?.data?.message || 'Error registering user. Please try again.');
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

      {/* Display success or error messages */}
      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      {/* Display User ID (either Pharmacist or Customer ID) */}
      {userID && (
        <div className="user-id-container">
          <p>Your Login ID:</p>
          <strong>{userID}</strong>
        </div>
      )}
    </div>
  );
}

export default SignUp;
