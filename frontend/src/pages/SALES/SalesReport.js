import React, { useState, useEffect } from 'react';
import './SalesReport.css';

function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sales`);

      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const data = await response.json();
      setSalesData(data);
      setFilteredData(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    return filteredData.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const filterByDate = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const filtered = salesData.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    setFilteredData(filtered);
  };

  const clearFilter = () => {
    setFilteredData(salesData);
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return <p>Loading sales data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="sales-report-container">
      <h2>Sales Report</h2>

      {/* Date Range Filter */}
      <div className="date-filter">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={filterByDate}>Filter</button>
        <button onClick={clearFilter}>Clear</button>
      </div>

      {/* Sales Table */}
      <table className="sales-table">
        <thead>
          <tr>
            <th>Sale ID</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Items Sold</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>{new Date(sale.date).toLocaleDateString()}</td>
              <td>${sale.totalAmount.toFixed(2)}</td>
              <td>
                <ul>
                  {sale.itemsSold.map(item => (
                    <li key={item.id}>
                      {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-revenue">
        <h3>Total Revenue: ${calculateTotalRevenue().toFixed(2)}</h3>
      </div>
    </div>
  );
}

export default SalesReport;
