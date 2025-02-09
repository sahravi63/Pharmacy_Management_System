const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const { connectDB, sequelize } = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: 'GET,POST,PUT,DELETE', 
allowedHeaders: 'Content-Type,Authorization',
}));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/medicines', medicineRoutes);

// Sync Sequelize models with the database
sequelize.sync({ alter: true })  // alter: true ensures the tables are updated without dropping
  .then(() => console.log('Database synced!'))
  .catch((err) => console.error('Error syncing database:', err));

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
