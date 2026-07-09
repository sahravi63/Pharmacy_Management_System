import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './auth/signUp/signUp';
import Login from './auth/login/login';
import Home from './components/Home/home';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/ADDMEDICINE/AddMedicine';
import ViewInventory from './pages/INVENTORY/ViewInventory';
import Orders from './pages/ORDERS/Order';
import SalesReport from './pages/SALES/SalesReport';
import CustomerProfile from './pages/CUSTOMERPROFILE/CustomerProfile';
import { getProfile } from './services/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    verifySession();
  }, []);

  const handleAuthenticated = (profile) => {
    setUser(profile);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const defaultPath = user?.role === 'customer' ? '/inventory' : '/dashboard';

  const ProtectedRoute = ({ children, roles }) => {
    if (!authChecked) return null;
    if (!isAuthenticated) return <Navigate to="/" />;
    if (roles && !roles.includes(user?.role)) return <Navigate to={defaultPath} />;
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="main">
          {isAuthenticated && <Sidebar user={user} />}
          <div className="content">
            <Routes>
              <Route path="/" element={isAuthenticated ? <Navigate to={defaultPath} /> : <Home />} />
              <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'pharmacist']}><Dashboard /></ProtectedRoute>} />
              <Route path="/add-medicine" element={<ProtectedRoute roles={['admin', 'pharmacist']}><AddMedicine /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><ViewInventory /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders user={user} /></ProtectedRoute>} />
              <Route path="/Orders" element={<Navigate to="/orders" />} />
              <Route path="/sales-report" element={<ProtectedRoute roles={['admin', 'pharmacist']}><SalesReport /></ProtectedRoute>} />
              <Route path="/customer-profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login onAuthenticated={handleAuthenticated} />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
