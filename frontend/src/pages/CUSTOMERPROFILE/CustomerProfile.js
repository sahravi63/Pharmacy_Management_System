import React, { useState, useEffect } from 'react';
import './CustomerProfile.css';

function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: No token found');
          setLoading(false);
          return;
        }

        const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch customer data');
        }

        const profileData = await profileResponse.json();
        setCustomer(profileData.user);
        setFormData({
          name: profileData.user.name || '',
          email: profileData.user.email || '',
          phone: profileData.user.phone || '',
          address: profileData.user.address || '',
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized: No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setCustomer(updatedData.customer);
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
            Name: <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </label>
          <label>
            Email: <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </label>
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
        <div className="profile-info">
          <h3>Profile Information</h3>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Address:</strong> {customer.address}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}

export default CustomerProfile;
