
const express = require('express');
const router = express.Router();
const { User } = require('../models/userModel');

router.get('/profile', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(req.user._id).populate('info');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
