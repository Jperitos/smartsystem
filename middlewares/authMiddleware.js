const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const tokenWithBearer = req.cookies.Authorization;
    if (!tokenWithBearer) return res.status(401).json({ error: 'No token' });

    const token = tokenWithBearer.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded; // { userId, email, role, sessionToken }

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
