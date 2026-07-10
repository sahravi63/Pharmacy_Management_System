import React, { useEffect, useState } from 'react';
import api from '../services/api';

const NotificationsPanel = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'pharmacist') {
      loadNotifications();
    }
  }, [user]);

  if (!user || (user.role !== 'admin' && user.role !== 'pharmacist')) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px', background: '#fff8e1', padding: '12px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Notifications</h3>
      {loading ? <p>Loading...</p> : notifications.length === 0 ? <p>No notifications</p> : notifications.map((notification) => (
        <div key={notification.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '6px' }}>
          <strong>{notification.title}</strong>
          <div>{notification.message}</div>
          <small>{new Date(notification.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPanel;
