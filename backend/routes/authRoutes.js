const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const Pharmacist = require('../models/pharmacist');
const Customer = require('../models/customer');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { createTokenPair, hashToken, compareToken } = require('../utils/generateToken');

const router = express.Router();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const getCookieValue = (cookieHeader = '', cookieName) => {
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const entry = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));
  return entry ? decodeURIComponent(entry.split('=').slice(1).join('=')) : null;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const accessCookieOptions = { ...cookieOptions, maxAge: 1000 * 60 * 15 };
const refreshCookieOptions = { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 7 };

const generatePharmacistID = (name) =>
  `PH-${name.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

const generateCustomerID = (name) =>
  `CU-${name.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('token', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

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

    if (role === 'admin') {
      await Pharmacist.create({ userId: newUser.id, name, email, pharmacistID: pharmacistID || generatePharmacistID(name) });
    } else if (role === 'pharmacist') {
      await Pharmacist.create({ userId: newUser.id, name, email, pharmacistID });
    } else if (role === 'customer') {
      await Customer.create({ userId: newUser.id, name, email, customerID });
    }

    const { accessToken, refreshToken } = await createTokenPair(newUser);
    await User.update({ refreshToken: await hashToken(refreshToken) }, { where: { id: newUser.id } });
    setTokenCookies(res, accessToken, refreshToken);

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
    res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, pharmacistID, customerID, role } = req.body;

  try {
    let user = null;

    if (role === 'admin') {
      user = await User.findOne({ where: { email, role: 'admin' } });
    } else if (role === 'pharmacist' && pharmacistID) {
      user = await User.findOne({ where: { pharmacistID, role: 'pharmacist' } });
    } else if (role === 'customer' && customerID) {
      user = await User.findOne({ where: { customerID, role: 'customer' } });
    } else if (email && role) {
      user = await User.findOne({ where: { email, role } });
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

    const { accessToken, refreshToken } = await createTokenPair(user);
    await User.update({ refreshToken: await hashToken(refreshToken) }, { where: { id: user.id } });
    setTokenCookies(res, accessToken, refreshToken);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacistID: user.pharmacistID,
        customerID: user.customerID,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken || getCookieValue(req.headers.cookie, 'refreshToken');

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user?.refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const isMatch = await compareToken(refreshToken, user.refreshToken);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = await createTokenPair(user);
    await User.update({ refreshToken: await hashToken(newRefreshToken) }, { where: { id: user.id } });
    setTokenCookies(res, accessToken, newRefreshToken);

    return res.json({ message: 'Token refreshed' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  const refreshToken = req.body.refreshToken || getCookieValue(req.headers.cookie, 'refreshToken');

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      await User.update({ refreshToken: null }, { where: { id: decoded.id } });
    } catch (err) {
      // ignore invalid tokens during logout
    }
  }

  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
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
    res.status(500).json({ message: 'Error fetching user' });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'pharmacistID', 'customerID'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile retrieved', user });
  } catch (err) {
    res.status(500).json({ message: 'Profile fetch error' });
  }
});

module.exports = router;
