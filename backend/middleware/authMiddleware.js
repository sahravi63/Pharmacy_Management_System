const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  console.log("Headers Received:", req.headers); // Debugging all headers

  const authHeader = req.header('Authorization');
  console.log("Received Auth Header:", authHeader); // Debugging

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1];
    console.log("Extracted Token:", token); // Debugging

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging

    req.user = decoded; // Ensure it contains `id`
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err); // Debugging
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
