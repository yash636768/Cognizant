const CareerModel = require('../careerModel');
const { callPythonRecommender } = require('./mlBridge');
const { TAXONOMY_PATH } = require('../config/paths');

const careerModel = new CareerModel(TAXONOMY_PATH);

/**
 * generateRecommendations
 * -----------------------
 * Career logic (skill gap analysis) stays in JS via careerModel.
 * Final scoring/ranking is delegated to the real Python ML model
 * (SentenceTransformer + FAISS) via callPythonRecommender().
 */
async function generateRecommendations(data) {
  const currentSkills      = data.current_skills       || [];
  const targetCareer       = data.target_career        || '';
  const userQuery          = data.user_query           || '';
  const preferredDifficulty= data.preferred_difficulty || 'Any';
  const preferredDuration  = data.preferred_duration   || 'Any';
  const preferredType      = data.preferred_type       || 'Any';
  const customWeights      = data.custom_weights       || null;
  const topK               = parseInt(data.top_k || 10, 10);

  /* ── Career Trajectory Matching (JS) ───────────────────────────────────── */
  const interestText = `${targetCareer} ${userQuery}`.trim();
  const careerEvals  = careerModel.evaluateCareers(currentSkills, interestText);

  let selectedCareerProfile = null;
  let targetMissingSkills   = [];

  if (targetCareer) {
    for (const c of careerEvals) {
      if (
        c.title.toLowerCase()      === targetCareer.toLowerCase() ||
        c.career_key.toLowerCase() === targetCareer.toLowerCase()
      ) {
        selectedCareerProfile = c;
        targetMissingSkills   = c.missing_core_skills.concat(c.missing_supp_skills);
        break;
      }
    }
  }

  if (!selectedCareerProfile && careerEvals.length > 0) {
    selectedCareerProfile = careerEvals[0];
    targetMissingSkills   = selectedCareerProfile.missing_core_skills.concat(
      selectedCareerProfile.missing_supp_skills
    );
  }

  /* ── Real ML Recommendations (Python via subprocess) ───────────────────── */
  const recommendations = await callPythonRecommender({
    current_skills               : currentSkills,
    target_career_missing_skills : targetMissingSkills,
    user_query                   : userQuery || (selectedCareerProfile ? selectedCareerProfile.title : ''),
    preferred_difficulty         : preferredDifficulty,
    preferred_duration           : preferredDuration,
    preferred_type               : preferredType,
    custom_weights               : customWeights,
    top_k                        : topK
  });

  return {
    dataset_grounding  : 'Powered by Hackathon Dataset (coursera_course_dataset_v3.csv)',
    ml_engine          : 'SentenceTransformer (all-MiniLM-L6-v2) + FAISS',
    career_candidates  : careerEvals,
    selected_career    : selectedCareerProfile,
    target_missing_skills: targetMissingSkills,
    recommendations
  };
}

module.exports = { generateRecommendations };
