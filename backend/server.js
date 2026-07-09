const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customer_ProfileRoutes = require('./routes/customer_profileRoutes');
const salesRoutes = require('./routes/salesRoutes');
const pharmacistRoutes = require('./routes/pharmacistRoutes');
const sequelize = require('./config/db');
require('./models');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notificationRoutes');
const initializeSocket = require('./services/socketService');
const startInventoryScheduler = require('./services/inventoryScheduler');

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
initializeSocket(server, FRONTEND_URL);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: 'GET,POST,PUT,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer', customer_ProfileRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Sync DB
sequelize.sync({ alter: process.env.NODE_ENV !== 'production' })
  .then(() => {
    console.log('Database synced successfully!');
    startInventoryScheduler();
  })
  .catch((error) => console.error('Error syncing database:', error));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or set a different PORT in backend/.env.`);
    process.exit(1);
  }

  throw error;
});
