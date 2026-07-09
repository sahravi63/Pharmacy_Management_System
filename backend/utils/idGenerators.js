const generatePharmacistID = () => {
    const prefix = 'PHARM';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}-${Date.now().toString().slice(-4)}`;
  };
  
  const generateCustomerID = () => {
    const prefix = 'CUST';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}-${Date.now().toString().slice(-4)}`;
  };
  
  module.exports = { generatePharmacistID, generateCustomerID };