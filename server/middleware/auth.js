const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT token on every protected route
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists or is inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Token invalid or expired' });
  }
};

// Restricts route to specific roles e.g. restrictTo('admin', 'staff')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };