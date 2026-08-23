const { registerUser, loginUser } = require('../auth');
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    const result = await registerUser({
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

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    const result = await loginUser({
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
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
