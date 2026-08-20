const {
  registerUser,
  loginUser,
  getUserByToken
} = require('../auth');

function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    const result = registerUser({
      name,
      email,
      password
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body || {};

    const result = loginUser({
      email,
      password
    });

    return res.json(result);
  } catch (err) {
    return res.status(401).json({
      error: err.message
    });
  }
}

function me(req, res) {
  const authHeader = req.headers.authorization || '';

  const token = authHeader
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    return res.status(401).json({
      error: 'No token provided.'
    });
  }

  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid or expired token.'
    });
  }

  return res.json({
    user
  });
}

module.exports = {
  register,
  login,
  me
};
