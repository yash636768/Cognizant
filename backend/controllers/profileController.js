const {
  readUserProfiles,
  writeUserProfiles,
  getProfileKey
} = require('../services/profileService');

function getProfile(req, res) {
  try {
    const profiles = readUserProfiles();
    const profileKey = getProfileKey(req.user);

    if (!profileKey) {
      return res.status(400).json({
        error: 'Unable to identify user.'
      });
    }

    const profile = profiles[profileKey];

    if (!profile) {
      return res.json({
        profile: null
      });
    }

    return res.json({
      profile
    });
  } catch (err) {
    console.error('Error in GET /api/profile:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

function updateProfile(req, res) {
  try {
    const profiles = readUserProfiles();
    const profileKey = getProfileKey(req.user);

    if (!profileKey) {
      return res.status(400).json({
        error: 'Unable to identify user.'
      });
    }

    const existingProfile = profiles[profileKey] || {
      name: req.user.name || '',
      email: req.user.email || '',
      assessment_history: []
    };

    const updatedProfile = {
      ...existingProfile,
      name: req.body.name ?? existingProfile.name,
      email: req.user.email || existingProfile.email,
      updated_at: new Date().toISOString()
    };

    profiles[profileKey] = updatedProfile;
    writeUserProfiles(profiles);

    return res.json({
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Error in PUT /api/profile:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

function saveAssessment(req, res) {
  try {
    const profiles = readUserProfiles();
    const profileKey = getProfileKey(req.user);

    if (!profileKey) {
      return res.status(400).json({
        error: 'Unable to identify user.'
      });
    }

    const existingProfile = profiles[profileKey] || {
      name: req.user.name || '',
      email: req.user.email || '',
      assessment_history: []
    };

    const assessment = {
      id: `assessment_${Date.now()}`,
      created_at: new Date().toISOString(),
      target_career: req.body.target_career || '',
      current_skills: req.body.current_skills || [],
      user_query: req.body.user_query || '',
      preferred_difficulty: req.body.preferred_difficulty || 'Any',
      preferred_duration: req.body.preferred_duration || 'Any',
      preferred_type: req.body.preferred_type || 'Any',
      custom_weights: req.body.custom_weights || null,
      selected_career: req.body.selected_career || null,
      target_missing_skills: req.body.target_missing_skills || [],
      recommendations: req.body.recommendations || []
    };

    const updatedProfile = {
      ...existingProfile,
      name: req.user.name || existingProfile.name,
      email: req.user.email || existingProfile.email,
      target_career: assessment.target_career,
      current_skills: assessment.current_skills,
      user_query: assessment.user_query,
      preferred_difficulty: assessment.preferred_difficulty,
      preferred_duration: assessment.preferred_duration,
      preferred_type: assessment.preferred_type,
      custom_weights: assessment.custom_weights,
      selected_career: assessment.selected_career,
      target_missing_skills: assessment.target_missing_skills,
      recommendations: assessment.recommendations,
      last_assessment_at: assessment.created_at,
      assessment_history: [
        ...(existingProfile.assessment_history || []),
        assessment
      ],
      updated_at: new Date().toISOString()
    };

    profiles[profileKey] = updatedProfile;
    writeUserProfiles(profiles);

    return res.status(201).json({
      message: 'Assessment saved successfully.',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Error in POST /api/profile/assessment:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

function deleteAssessment(req, res) {
  try {
    const profiles = readUserProfiles();
    const profileKey = getProfileKey(req.user);

    if (!profileKey) {
      return res.status(400).json({
        error: 'Unable to identify user.'
      });
    }

    const profile = profiles[profileKey];

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found.'
      });
    }

    const history = profile.assessment_history || [];
    const updatedHistory = history.filter(
      (item) => item.id !== req.params.id
    );

    profiles[profileKey] = {
      ...profile,
      assessment_history: updatedHistory,
      updated_at: new Date().toISOString()
    };

    writeUserProfiles(profiles);

    return res.json({
      message: 'Assessment removed successfully.',
      profile: profiles[profileKey]
    });
  } catch (err) {
    console.error('Error deleting assessment:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  saveAssessment,
  deleteAssessment
};
