import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('/api/medicines');
        setMedicines(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  if (error) {
    return <div>Error fetching inventory: Backend not connected yet {error}</div>;
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      {medicines.length === 0 ? (
        <p>No medicines available in inventory.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Stock</th>
              <th className="py-2 px-4 border-b">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine._id}>
                <td className="py-2 px-4 border-b">{medicine.name}</td>
                <td className="py-2 px-4 border-b">{medicine.description}</td>
                <td className="py-2 px-4 border-b">${medicine.price.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{medicine.stock}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(medicine.expiryDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewInventory;
