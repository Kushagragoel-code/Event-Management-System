const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin
};
