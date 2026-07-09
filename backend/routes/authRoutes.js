const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Pharmacist = require('../models/pharmacist');
const Customer = require('../models/customer');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// ENV check
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60,
};

const generatePharmacistID = (name) =>
  `PH-${name.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

const generateCustomerID = (name) =>
  `CU-${name.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

// =============================
// Signup
// =============================
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const pharmacistID = role === 'pharmacist' ? generatePharmacistID(name) : null;
    const customerID = role === 'customer' ? generateCustomerID(name) : null;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      pharmacistID,
      customerID,
    });

    if (role === 'pharmacist') {
      await Pharmacist.create({
        userId: newUser.id,
        name,
        email,
        pharmacistID,
      });
    } else if (role === 'customer') {
      await Customer.create({
        userId: newUser.id,
        name,
        email,
        customerID,
      });
    }

    const token = generateToken(newUser);
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        pharmacistID: newUser.pharmacistID,
        customerID: newUser.customerID,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// =============================
// Login
// =============================
router.post('/login', async (req, res) => {
  const { email, password, pharmacistID, customerID, role } = req.body;

  try {
    let user = null;

    if (role === 'pharmacist' && pharmacistID) {
      user = await User.findOne({
        where: { pharmacistID, role: 'pharmacist' }
      });
    } else if (role === 'customer' && customerID) {
      user = await User.findOne({
        where: { customerID, role: 'customer' }
      });
    } else if (email && role) {
      user = await User.findOne({
        where: { email, role }
      });
    } else {
      return res.status(400).json({ message: 'Please provide login credentials' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found or role mismatch' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacistID: user.pharmacistID,
        customerID: user.customerID,
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});
// =============================
// Get User by ID or Custom ID
// =============================
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
});

router.get('/user/:identifier', authenticate, requireRole('admin', 'pharmacist'), async (req, res) => {
  const { identifier } = req.params;

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: !isNaN(identifier) ? Number(identifier) : null },
          { pharmacistID: identifier },
          { customerID: identifier },
        ],
      },
      attributes: ['id', 'name', 'email', 'role', 'pharmacistID', 'customerID'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// =============================
// Authenticated Profile
// =============================
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'pharmacistID', 'customerID'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile retrieved', user });
  } catch (err) {
    res.status(500).json({ message: 'Profile fetch error', error: err.message });
  }
});

module.exports = router;
