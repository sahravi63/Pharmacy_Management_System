import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './viewInventory.css';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  expiryDate: '',
  requiresPrescription: false,
  prescriptionNotes: '',
};

const ViewInventory = ({ user }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [adjustment, setAdjustment] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const canManageInventory = ['admin', 'pharmacist'].includes(user?.role);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching inventory');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchMedicines();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (medicine) => {
    setEditingId(medicine.id);
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      price: medicine.price,
      stock: medicine.stock,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
      requiresPrescription: Boolean(medicine.requiresPrescription),
      prescriptionNotes: medicine.prescriptionNotes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!canManageInventory) {
      setStatusMessage('Only admins and pharmacists can edit inventory.');
      return;
    }

    try {
      await api.put(`/medicines/${editingId}`, { ...formData, stock: Number(formData.stock), price: Number(formData.price) });
      setStatusMessage('Medicine updated');
      setEditingId(null);
      setFormData(emptyForm);
      await fetchMedicines();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Unable to update medicine');
    }
  };

  const adjustStock = async (medicineId) => {
    if (!canManageInventory) {
      setStatusMessage('Only admins and pharmacists can adjust stock.');
      return;
    }

    const parsed = Number(adjustment);
    if (!Number.isInteger(parsed)) {
      setStatusMessage('Enter a whole-number adjustment');
      return;
    }

    try {
      await api.patch(`/medicines/${medicineId}/stock`, { adjustment: parsed });
      setStatusMessage('Stock adjusted');
      setAdjustment('');
      await fetchMedicines();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Unable to adjust stock');
    }
  };

  const deleteMedicine = async (medicineId) => {
    if (!canManageInventory) {
      setStatusMessage('Only admins and pharmacists can delete inventory items.');
      return;
    }

    if (!window.confirm('Delete this medicine from inventory?')) return;

    try {
      await api.delete(`/medicines/${medicineId}`);
      setStatusMessage('Medicine removed');
      await fetchMedicines();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Unable to delete medicine');
    }
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
      {statusMessage && <p className="status-message">{statusMessage}</p>}
      {!canManageInventory && <p className="status-message">Inventory is read-only for your role.</p>}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{medicine.name}</td>
                  <td>{medicine.description || 'N/A'}</td>
                  <td>{medicine.price ? `$${medicine.price.toFixed(2)}` : 'N/A'}</td>
                  <td>{medicine.stock || 'Out of Stock'}</td>
                  <td>{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {canManageInventory ? (
                      <>
                        <button className="inventory-button" onClick={() => startEdit(medicine)}>Edit</button>
                        <button className="inventory-button danger" onClick={() => deleteMedicine(medicine.id)}>Delete</button>
                        <div style={{ marginTop: '8px' }}>
                          <input value={adjustment} onChange={(event) => setAdjustment(event.target.value)} placeholder="Adjust stock" />
                          <button className="inventory-button" onClick={() => adjustStock(medicine.id)}>Apply</button>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingId && (
        <form className="inventory-form" onSubmit={saveEdit}>
          <h3>Edit medicine</h3>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
          <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" required />
          <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock" required />
          <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
          <label>
            <input name="requiresPrescription" type="checkbox" checked={formData.requiresPrescription} onChange={handleChange} />
            Requires prescription
          </label>
          <input name="prescriptionNotes" value={formData.prescriptionNotes} onChange={handleChange} placeholder="Prescription notes" />
          <div>
            <button className="inventory-button" type="submit">Save</button>
            <button className="inventory-button" type="button" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ViewInventory;
