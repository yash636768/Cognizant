const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: String,
    email: String,
    target_career: String,
    current_skills: [String],
    user_query: String,
    preferred_difficulty: String,
    preferred_duration: String,
    preferred_type: String,
    custom_weights: mongoose.Schema.Types.Mixed,
    selected_career: mongoose.Schema.Types.Mixed,
    target_missing_skills: [String],
    recommendations: [mongoose.Schema.Types.Mixed],
    last_assessment_at: String,
    assessment_history: [mongoose.Schema.Types.Mixed]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);