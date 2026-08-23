const {
  getProfile,
  saveProfile
} = require('../services/profileService');

function defaultProfile(user) {
  return {
    name: user.name || '',
    email: user.email || '',
    assessment_history: []
  };
}

async function getProfileController(req, res) {
  try {
    const profile = await getProfile(req.user);
    return res.json({ profile: profile || null });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const existing = (await getProfile(req.user)) || defaultProfile(req.user);
    const profile = await saveProfile(req.user, {
      ...existing,
      name: req.body.name ?? existing.name,
      email: req.user.email,
      updated_at: new Date().toISOString()
    });

    return res.json({ message: 'Profile updated successfully.', profile });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function saveAssessment(req, res) {
  try {
    const existing = (await getProfile(req.user)) || defaultProfile(req.user);
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
    const profile = await saveProfile(req.user, {
      ...existing,
      name: req.user.name || existing.name,
      email: req.user.email,
      ...assessment,
      last_assessment_at: assessment.created_at,
      assessment_history: [...(existing.assessment_history || []), assessment],
      updated_at: new Date().toISOString()
    });

    return res.status(201).json({ message: 'Assessment saved successfully.', profile });
  } catch (error) {
    console.error('Error in POST /api/profile/assessment:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function deleteAssessment(req, res) {
  try {
    const existing = await getProfile(req.user);
    if (!existing) return res.status(404).json({ error: 'Profile not found.' });

    const profile = await saveProfile(req.user, {
      ...existing,
      assessment_history: (existing.assessment_history || []).filter(
        (item) => item.id !== req.params.id
      ),
      updated_at: new Date().toISOString()
    });

    return res.json({ message: 'Assessment removed successfully.', profile });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProfile: getProfileController,
  updateProfile,
  saveAssessment,
  deleteAssessment
};
