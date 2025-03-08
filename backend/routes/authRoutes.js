const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');  
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generatePharmacistID = () => 'PHARM-' + Math.floor(1000 + Math.random() * 9000);
const generateCustomerID = () => 'CUST-' + Math.floor(1000 + Math.random() * 9000);

// **User Registration**
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate IDs based on role
    const pharmacistID = role === 'pharmacist' ? generatePharmacistID() : null;
    const customerID = role === 'customer' ? generateCustomerID() : null;

    console.log('Generated Pharmacist ID:', pharmacistID);
    console.log('Generated Customer ID:', customerID);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      pharmacistID,
      customerID,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacistID: user.pharmacistID,
        customerID: user.customerID,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// **Fetch User by ID, PharmacistID, or CustomerID**
router.get('/user/:identifier', async (req, res) => {
  const { identifier } = req.params;
  console.log('Fetching user with identifier:', identifier);

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: !isNaN(identifier) ? Number(identifier) : null }, 
          { pharmacistID: identifier }, 
          { customerID: identifier }
        ],
      },
      attributes: ['id', 'name', 'email', 'role', 'pharmacistID', 'customerID'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error retrieving user details', error: error.message });
  }
});

// **Login Route**
router.post('/login', async (req, res) => {
  const { email, password, pharmacistID, customerID } = req.body;

  try {
    let user;
    
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (pharmacistID) {
      user = await User.findOne({ where: { pharmacistID } });
    } else if (customerID) {
      user = await User.findOne({ where: { customerID } });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacistID: user.pharmacistID,
        customerID: user.customerID,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// **Middleware to Protect Routes**
const protect = (req, res, next) => {
  let token;

  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  if (req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// **Fetch User Profile**
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user, { attributes: ['id', 'name', 'email', 'role', 'pharmacistID', 'customerID'] });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile information', user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
});

module.exports = router;
