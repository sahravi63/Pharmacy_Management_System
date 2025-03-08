const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, pharmacistId: user.pharmacistId }, // added pharmacistId
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = generateToken;
