const jwt = require('jsonwebtoken');
const { getUserById } = require('../auth');

async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }
}

module.exports = authenticateUser;
