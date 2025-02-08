const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize('pharmacy_db', 'root', 'Ravi@123', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced!'))
  .catch((err) => console.error('Error syncing database:', err));

module.exports = { sequelize };
