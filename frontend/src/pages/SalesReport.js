import React, { useState } from 'react';
import './SalesReport.css'; // Add this file for styling

function SalesReport() {
  const [salesData, setSalesData] = useState([
    {
      id: 1,
      date: '2025-01-15',
      customerName: 'John Doe',
      totalAmount: 150,
      itemsSold: [
        { name: 'Paracetamol', quantity: 3, price: 50 },
      ],
    },
    {
      id: 2,
      date: '2025-01-16',
      customerName: 'Jane Smith',
      totalAmount: 200,
      itemsSold: [
        { name: 'Amoxicillin', quantity: 2, price: 100 },
      ],
    },
  ]);

  // Example of total revenue calculation
  const calculateTotalRevenue = () => {
    return salesData.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  // Placeholder for date range filter (not functional in this example)
  const filterByDate = (startDate, endDate) => {
    // You would implement date filtering logic here
    console.log(`Filtering sales from ${startDate} to ${endDate}`);
  };

  return (
    <div className="sales-report-container">
      <h2>Sales Report</h2>

      {/* Date Range Filter - This can be used to filter sales */}
      <div className="filter-container">
        <label>
          Start Date:
          <input type="date" name="startDate" />
        </label>
        <label>
          End Date:
          <input type="date" name="endDate" />
        </label>
        <button onClick={() => filterByDate()}>Filter</button>
      </div>

      {/* Sales Table */}
      <table className="sales-report-table">
        <thead>
          <tr>
            <th>Sale ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Items Sold</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>{sale.date}</td>
              <td>{sale.customerName}</td>
              <td>
                <ul>
                  {sale.itemsSold.map((item, index) => (
                    <li key={index}>
                      {item.name} (Qty: {item.quantity}, Price: ${item.price})
                    </li>
                  ))}
                </ul>
              </td>
              <td>${sale.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Revenue */}
      <div className="total-revenue">
        <h3>Total Revenue: ${calculateTotalRevenue()}</h3>
      </div>
    </div>
  );
}

export default SalesReport;
