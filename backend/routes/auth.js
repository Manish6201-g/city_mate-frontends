const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@citymate.com';
const ADMIN_PASSWORD_HASH = '$2a$10$bpVi7dFTtjbMFtM3u2Lcee8H37rkRR2g4R0A6pQJvTbwuQdhWQQum'; // bcrypt.hashSync('admin123')

router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email: ADMIN_EMAIL, role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );

  res.json({ success: true, token, email });
});

module.exports = {
  router,
  authenticateAdmin: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
};
