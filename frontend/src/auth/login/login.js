import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './login.css';

function Login({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role is customer
  const [customerID, setCustomerID] = useState('');
  const [pharmacistID, setPharmacistID] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let loginData = { password, role }; // Include role always

      if (role === 'customer' && customerID) {
        loginData.customerID = customerID;
      } else if (role === 'pharmacist' && pharmacistID) {
        loginData.pharmacistID = pharmacistID;
      } else {
        loginData.email = email;
      }
      

      // Send request to backend
      const response = await api.post('/auth/login', loginData);

      if (response.data.user) {
        const user = response.data.user;
        onAuthenticated(user);
        setMessage('Login successful!');
        navigate(user.role === 'customer' ? '/inventory' : '/dashboard');
      } else {
        setMessage(response.data.message || 'Login failed');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        {message && (
          <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={role !== 'customer' && role !== 'pharmacist'}
              required={role !== 'customer' && role !== 'pharmacist'}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="customer">Customer</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>

          {/* Customer ID Field (Only if 'Customer' is selected) */}
          {role === 'customer' && (
            <div className="form-group">
              <label>Customer ID:</label>
              <input
                type="text"
                value={customerID}
                onChange={(e) => setCustomerID(e.target.value)}
                placeholder="Enter your Customer ID (optional)"
              />
            </div>
          )}

          {/* Pharmacist ID Field (Only if 'Pharmacist' is selected) */}
          {role === 'pharmacist' && (
            <div className="form-group">
              <label>Pharmacist ID:</label>
              <input
                type="text"
                value={pharmacistID}
                onChange={(e) => setPharmacistID(e.target.value)}
                placeholder="Enter your Pharmacist ID (optional)"
              />
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
