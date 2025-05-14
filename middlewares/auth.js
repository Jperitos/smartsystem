const { User } = require('../models/userModel');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const authHeader = req.cookies.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.sessionToken !== decoded.sessionToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
