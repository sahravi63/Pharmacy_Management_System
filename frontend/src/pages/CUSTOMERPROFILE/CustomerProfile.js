import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CustomerProfile.css';

function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: '', address: '' });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const profileResponse = await api.get('/auth/profile');
        const profileData = profileResponse.data;
        let mergedProfile = profileData.user;

        if (profileData.user.role === 'customer') {
          const customerResponse = await api.get('/customer/profile');
          mergedProfile = { ...profileData.user, ...customerResponse.data.user };
        }

        setCustomer(mergedProfile);
        setFormData({
          phone: mergedProfile.phone || '',
          address: mergedProfile.address || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/customer/profile', formData);
      const updatedData = response.data;
      setCustomer({ ...customer, ...updatedData.customer });
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="customer-profile-container">
      <h2>Customer Profile</h2>

      {isEditing ? (
        <div className="edit-profile">
          <label>
            Phone: <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </label>
          <label>
            Address: <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </label>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-details">
          <p><strong>Name:</strong> {customer?.name}</p>
          <p><strong>Email:</strong> {customer?.email}</p>

          {/* Conditionally render customerID or pharmacistID based on user role */}
          {customer?.role === 'customer' ? (
            <p><strong>CustomerID:</strong> {customer?.customerID}</p>
          ) : customer?.role === 'pharmacist' ? (
            <p><strong>PharmacistID:</strong> {customer?.pharmacistID}</p>
          ) : null}

          <p><strong>Phone:</strong> {customer?.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {customer?.address || 'N/A'}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}

export default CustomerProfile;
