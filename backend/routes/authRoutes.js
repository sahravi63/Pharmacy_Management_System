const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper function to generate a Pharmacist ID
const generatePharmacistID = () => {
  return 'PHARM-' + Math.floor(1000 + Math.random() * 9000); // Example pharmacist ID format
};

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      pharmacistID: role === 'pharmacist' ? generatePharmacistID() : null, // Create PharmacistID for role 'pharmacist'
    });

    // Respond with success, token, and pharmacistID if applicable
    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user.id),
      pharmacistID: user.pharmacistID,
    });
  } catch (error) {
    console.error('Error registering user:', error);  // Log the error for debugging
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = generateToken(user.id);

    // Respond with the token
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Middleware to protect routes (only logged-in users can access)
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from the header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user ID to the request object
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

// Protected route to get the user profile
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Profile information', userId: req.user });
});

module.exports = router;
