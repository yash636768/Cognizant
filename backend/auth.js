const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getUsers() {
  ensureUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users file:", err);
    return [];
  }
}

function saveUsers(users) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function hashPassword(password, salt) {
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return hash;
}

function generateToken(userId) {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  return Buffer.from(payload).toString('base64');
}

function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();

  const existing = users.find((u) => u.email === cleanEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const token = generateToken(userId);

  const newUser = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    salt,
    passwordHash,
    token,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    },
    token: newUser.token
  };
}

function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();

  const user = users.find((u) => u.email === cleanEmail);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  // Refresh token
  const token = generateToken(user.id);
  user.token = token;
  saveUsers(users);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    token
  };
}

function getUserByToken(token) {
  if (!token) return null;
  const users = getUsers();
  const user = users.find((u) => u.token === token);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserByToken
};
