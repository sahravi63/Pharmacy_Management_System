import React from 'react';
import './Header.css';

function Header({ isAuthenticated }) {
  return (
    <header className="header">
      <nav className="box">
        <div className="logo"></div>
        <h1>Pharmacy Management System</h1>
        <ul className="nav-list">
          {isAuthenticated ? (
            <>
              <li><a href="/Customer-profile" className="nav-item">Profile</a></li>
              <li><a href="/search" className="nav-item">Search</a></li>
              <li><a href="/" className="nav-item">Log out</a></li>
            </>
          ) : (
            <>
              <li><a href="/" className="nav-item">Home</a></li>
              <li><a href="/signup" className="nav-item">SignUp</a></li>
              <li><a href="/login" className="nav-item">Login</a></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
