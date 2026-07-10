const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user, { type = 'access' } = {}) => {
  const secret = type === 'refresh' ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) : process.env.JWT_SECRET;
  const expiresIn = type === 'refresh' ? (process.env.JWT_REFRESH_EXPIRE || '7d') : (process.env.JWT_EXPIRE || '15m');

  return jwt.sign(
    { id: user.id, role: user.role },
    secret,
    { expiresIn }
  );
};

const createTokenPair = async (user) => {
  const accessToken = generateToken(user, { type: 'access' });
  const refreshToken = generateToken(user, { type: 'refresh' });
  return { accessToken, refreshToken };
};

const hashToken = async (token) => bcrypt.hash(token, 10);
const compareToken = async (token, hash) => bcrypt.compare(token, hash);

module.exports = generateToken;
module.exports.generateToken = generateToken;
module.exports.createTokenPair = createTokenPair;
module.exports.hashToken = hashToken;
module.exports.compareToken = compareToken;
