import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './auth/signUp/signUp';
import Login from './auth/login/login';
import Home from './components/Home/home';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/AddMedicine';
import ViewInventory from './pages/ViewInventory';
import Orders from './pages/Order';
import SalesReport from './pages/SalesReport';
import CustomerProfile from './pages/CustomerProfile';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace this with actual authentication logic

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} />
        <div className="main">
          {isAuthenticated && <Sidebar />} {/* Show Sidebar only if authenticated */}
          <div className="content">
            <Routes>
              {/* Redirect to dashboard if authenticated */}
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/add-medicine" element={isAuthenticated ? <AddMedicine /> : <Navigate to="/" />} />
              <Route path="/inventory" element={isAuthenticated ? <ViewInventory /> : <Navigate to="/" />} />
              <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/" />} />
              <Route path="/sales-report" element={isAuthenticated ? <SalesReport /> : <Navigate to="/" />} />
              <Route path="/customer-profile" element={isAuthenticated ? <CustomerProfile /> : <Navigate to="/" />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
