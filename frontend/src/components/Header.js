import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import './Header.css';

function Header({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async (event) => {
    event.preventDefault();
    await logout().catch(() => {});
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <nav className="box">
        <div className="logo"></div>
        <h1>Pharmacy Management System</h1>
        <ul className="nav-list">
          {isAuthenticated ? (
            <>
              {/* <li><a href="/customer-profile" className="nav-item">Profile</a></li> */}
              <li><Link to="/inventory" className="nav-item">Search</Link></li>
              <li><a href="/" onClick={handleLogout} className="nav-item">Log out</a></li>
            </>
          ) : (
            <>
              <li><Link to="/" className="nav-item">Home</Link></li>
              <li><Link to="/signup" className="nav-item">SignUp</Link></li>
              <li><Link to="/login" className="nav-item">Login</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
