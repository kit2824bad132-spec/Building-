const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'saravanan_builders_super_secret_jwt_key_2026_xyz';

// Verify any authenticated user (Customer or Admin)
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

// Require Admin Role
function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
    }
  });
}

// Require Customer Role
function requireCustomer(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'customer' || req.user.role === 'admin')) {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Access denied: Customer account required.' });
    }
  });
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireCustomer,
  JWT_SECRET
};
