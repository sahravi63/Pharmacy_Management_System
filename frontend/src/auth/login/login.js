import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  const [pharmacistID, setPharmacistID] = useState(''); // Only relevant if role is pharmacist
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create login payload
      const loginData = { email, password, role };
      if (role === 'pharmacist') {
        loginData.pharmacistID = pharmacistID; // Add pharmacistID if role is pharmacist
      }

      // Send login request to backend
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);

      // Save token to localStorage and handle navigation
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful!');
      setIsAuthenticated(true); // Set authentication state to true
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'Error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="customer">Customer</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
        </div>

        {role === 'pharmacist' && (
          <div>
            <label>Pharmacist ID:</label>
            <input
              type="text"
              value={pharmacistID}
              onChange={(e) => setPharmacistID(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
