const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();
  if (await User.exists({ email: cleanEmail })) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = await User.create({
    name: name.trim(),
    email: cleanEmail,
    passwordHash: await bcrypt.hash(password, 12)
  });

  return {
    user: publicUser(newUser),
    token: createToken(newUser._id.toString())
  };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password.");
  }

  return {
    user: publicUser(user),
    token: createToken(user._id.toString())
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  return user ? publicUser(user) : null;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
