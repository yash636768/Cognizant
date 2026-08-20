const { getUserByToken } = require('../auth');

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization || '';

  const token = authHeader
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }

  req.user = user;
  next();
}

module.exports = authenticateUser;
