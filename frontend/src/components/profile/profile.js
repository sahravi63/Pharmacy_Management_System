import React, { useState, useEffect } from 'react';
import './profile.css'; // Assuming you have custom styling
import getUserDetails from './api/getUserDetails'; // Import the API request function

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
        const userData = await getUserDetails(token);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {user && (
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {/* Display other user details as needed */}
          {user.role && <p><strong>Role:</strong> {user.role}</p>}
        </div>
      )}
    </div>
  );
}

export default Profile;
