const Profile = require('../models/Profile');

async function getProfile(user) {
  return Profile.findOne({ user: user.id }).lean();
}

async function saveProfile(user, profileData) {
  const {
    _id,
    user: existingUser,
    createdAt,
    updatedAt,
    ...safeProfileData
  } = profileData;

  return Profile.findOneAndUpdate(
    { user: user.id },
    { $set: { ...safeProfileData, user: user.id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
}

module.exports = { getProfile, saveProfile };
