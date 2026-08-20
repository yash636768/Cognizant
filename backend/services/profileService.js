const fs = require('fs');
const { USER_PROFILES_PATH } = require('../config/paths');

function readUserProfiles() {
  try {
    if (!fs.existsSync(USER_PROFILES_PATH)) {
      return {};
    }

    const raw = fs.readFileSync(
      USER_PROFILES_PATH,
      'utf-8'
    );

    return JSON.parse(raw || '{}');
  } catch (error) {
    console.error(
      'Error reading user profiles:',
      error
    );

    return {};
  }
}

function writeUserProfiles(profiles) {
  fs.writeFileSync(
    USER_PROFILES_PATH,
    JSON.stringify(
      profiles,
      null,
      2
    )
  );
}

function getProfileKey(user) {
  if (!user) {
    return null;
  }

  return (
    user.email ||
    user.id ||
    user._id ||
    null
  );
}

module.exports = {
  readUserProfiles,
  writeUserProfiles,
  getProfileKey
};
