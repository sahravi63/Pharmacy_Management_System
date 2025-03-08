import React from 'react';
import './home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Pharmacy Management System</h1>
        <p>Your one-stop solution for all your pharmacy needs.</p>
      </header>

      <section className="features-section">
        <h2>Our Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <h3>Manage Medicines</h3>
            <p>Easily manage your medicine inventory with real-time stock updates.</p>
          </div>
          <div className="feature-item">
            <h3>Order Management</h3>
            <p>Track customer orders, update status, and ensure timely deliveries.</p>
          </div>
          <div className="feature-item">
            <h3>Pharmacist & Customer Access</h3>
            <p>Role-based access for pharmacists and customers to manage tasks efficiently.</p>
          </div>
        </div>

        {/* <div className="feature-item">
            <h3>Order Management</h3>
            <p>Track customer orders, update status, and ensure timely deliveries.</p>
          </div>
          <div className="feature-item">
            <h3>Pharmacist & Customer Access</h3>
            <p>Role-based access for pharmacists and customers to manage tasks efficiently.</p>
          </div> */}
      </section>


    </div>
  );
}

export default Home;
