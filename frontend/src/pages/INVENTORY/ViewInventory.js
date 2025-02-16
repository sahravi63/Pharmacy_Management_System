import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './viewInventory.css'; // Make sure the correct path is used

const ViewInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch medicines function defined outside useEffect
  const fetchMedicines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medicines'); // Ensure your backend is running at this port
      setMedicines(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching inventory');
      setLoading(false);
    }
  };

  // useEffect to fetch medicines on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchMedicines(); // Retry fetching on error
  };

  if (loading) {
    return <div className="text-center mt-4">Loading inventory...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-4 text-red-600">
        <p>{error}</p>
        <button onClick={retryFetch} className="mt-2 text-blue-500 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <h2 className="inventory-heading">Medicine Inventory</h2>
      {medicines.length === 0 ? (
        <p className="text-center">No medicines available in the inventory.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price ($)</th>
                <th>Stock</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine._id}>
                  <td>{medicine.name}</td>
                  <td>{medicine.description || 'N/A'}</td>
                  <td>{medicine.price ? `$${medicine.price.toFixed(2)}` : 'N/A'}</td>
                  <td>{medicine.stock || 'Out of Stock'}</td>
                  <td>{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewInventory;
