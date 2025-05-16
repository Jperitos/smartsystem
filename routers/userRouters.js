const express = require('express');
const router = express.Router();
const { User } = require('../models/userModel');
const authMiddleware = require('../middlewares/authMiddleware'); 
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('info').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
