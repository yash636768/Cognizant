const fs = require('fs');

const DEFAULT_WEIGHTS = {
  semantic_skill_match: 0.40,
  career_skill_gap_relevance: 0.20,
  rating: 0.10,
  difficulty_fit: 0.10,
  duration_fit: 0.08,
  enrollment_popularity: 0.05,
  review_confidence: 0.04,
  type_preference: 0.03
};

const DIFFICULTY_MAP = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  mixed: 2
};

const DURATION_HOURS = {
  'less than 2 hours': 2,
  '1 - 4 weeks': 20,
  '1 - 3 months': 60,
  '3 - 6 months': 120
};

class HybridRecommender {
  constructor(metadataPath, embeddingsPath = null, faissPath = null) {
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found at ${metadataPath}`);
    }

    this.metadataPath = metadataPath;
    this.embeddingsPath = embeddingsPath;
    this.faissPath = faissPath;

    // Load metadata once into memory
    this.courses = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Precompute max values for normalization
    let maxEnrolled = 1;
    let maxReviews = 1;
    for (let i = 0; i < this.courses.length; i++) {
      const c = this.courses[i];
      if (c.enrolled_count && c.enrolled_count > maxEnrolled) maxEnrolled = c.enrolled_count;
      if (c.review_count && c.review_count > maxReviews) maxReviews = c.review_count;
    }
    this.maxEnrolled = maxEnrolled;
    this.maxReviews = maxReviews;

    // Precompute skill sets and search corpus for fast in-memory matching
    this.precomputed = this.courses.map(course => {
      const skillsStr = course.skills || '';
      const skillList = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const skillSetLower = new Set(skillList.map(s => s.toLowerCase()));
      const textCorpus = `${course.title || ''} ${skillsStr} ${course.description || ''}`.toLowerCase();
      return {
        course,
        skillList,
        skillSetLower,
        textCorpus
      };
    });
  }

  recommend(options = {}) {
    const {
      current_skills = [],
      target_career_missing_skills = [],
      user_query = '',
      preferred_difficulty = 'Any',
      preferred_duration = 'Any',
      preferred_type = 'Any',
      custom_weights = null,
      top_k = 10
    } = options;

    const weights = Object.assign({}, DEFAULT_WEIGHTS, custom_weights || {});

    const targetMissing = (target_career_missing_skills || [])
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean);
    const targetMissingSet = new Set(targetMissing);

    const userSkills = (current_skills || [])
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean);
    const userSkillsSet = new Set(userSkills);

    const combQueryText = `${user_query} ${userSkills.join(' ')} ${targetMissing.join(' ')}`
      .toLowerCase();
    const queryTokens = combQueryText.split(/\W+/).filter(Boolean);

    const scored = this.precomputed.map(({ course, skillList, skillSetLower, textCorpus }) => {
      // 1. Semantic Skill Match
      let semScore = 0.5;
      if (queryTokens.length > 0) {
        let matchCount = 0;
        for (let i = 0; i < queryTokens.length; i++) {
          if (textCorpus.includes(queryTokens[i])) {
            matchCount++;
          }
        }
        semScore = Math.min(matchCount / Math.max(queryTokens.length * 0.4, 1), 1.0);
      }

      // 2. Skill-Gap & Relevance Score
      let gapOverlap = 0;
      for (const s of targetMissing) {
        if (skillSetLower.has(s)) gapOverlap++;
      }

      let userOverlap = 0;
      for (const s of userSkills) {
        if (skillSetLower.has(s)) userOverlap++;
      }

      let gapScore = 0;
      if (targetMissing.length > 0) {
        gapScore = (gapOverlap / Math.max(targetMissing.length, 1)) * 0.7 +
                   (userOverlap / Math.max(skillSetLower.size, 1)) * 0.3;
      } else {
        gapScore = userOverlap / Math.max(skillSetLower.size, 1);
      }
      gapScore = Math.min(gapScore, 1.0);

      // 3. Rating Score (Normalized 0.0 - 1.0)
      const ratingScore = Math.min(Math.max((Number(course.ratings) || 4.0) / 5.0, 0), 1.0);

      // 4. Difficulty Fit Score
      let diffScore = 1.0;
      if (preferred_difficulty && preferred_difficulty.toLowerCase() !== 'any') {
        const targetDiffVal = DIFFICULTY_MAP[preferred_difficulty.toLowerCase()] || 2;
        const courseDiffVal = DIFFICULTY_MAP[(course.difficulty || '').toLowerCase()] || 2;
        const diffDiff = Math.abs(targetDiffVal - courseDiffVal);
        diffScore = Math.max(1.0 - (diffDiff * 0.4), 0.1);
      }

      // 5. Duration Fit Score
      let durationScore = 1.0;
      if (preferred_duration && preferred_duration.toLowerCase() !== 'any') {
        const targetDurVal = DURATION_HOURS[preferred_duration.toLowerCase()] || 60;
        const courseDurVal = DURATION_HOURS[(course.duration || '').toLowerCase()] || 60;
        const durDiff = Math.abs(targetDurVal - courseDurVal) / Math.max(targetDurVal, 1);
        durationScore = Math.max(1.0 - durDiff, 0.1);
      }

      // 6. Enrollment Popularity (Log-scaled)
      const enrollScore = Math.log1p(Number(course.enrolled_count) || 0) / Math.log1p(this.maxEnrolled);

      // 7. Review Confidence (Log-scaled)
      const reviewScore = Math.log1p(Number(course.review_count) || 0) / Math.log1p(this.maxReviews);

      // 8. Type Preference Score
      let typeScore = 1.0;
      if (preferred_type && preferred_type.toLowerCase() !== 'any') {
        typeScore = (course.type || '').toLowerCase() === preferred_type.toLowerCase() ? 1.0 : 0.4;
      }

      // Weighted Composite Final Score
      const finalScore = (
        weights.semantic_skill_match * semScore +
        weights.career_skill_gap_relevance * gapScore +
        weights.rating * ratingScore +
        weights.difficulty_fit * diffScore +
        weights.duration_fit * durationScore +
        weights.enrollment_popularity * enrollScore +
        weights.review_confidence * reviewScore +
        weights.type_preference * typeScore
      );

      // Identify matched skills for display
      const matchedGapSkills = skillList.filter(s => targetMissingSet.has(s.toLowerCase()));

      return {
        course_id: Number(course.vector_id) || 0,
        title: course.title,
        organization: course.organization,
        rating: course.ratings,
        review_count: course.review_count,
        enrolled_count: course.enrolled_count,
        difficulty: course.difficulty,
        duration: course.duration,
        type: course.type,
        course_url: course.course_url,
        skills: course.skills,
        matched_gap_skills: matchedGapSkills,
        final_score: Number(finalScore.toFixed(4)),
        score_breakdown: {
          semantic_match: Math.round(semScore * 1000) / 10,
          skill_gap_relevance: Math.round(gapScore * 1000) / 10,
          rating_quality: Math.round(ratingScore * 1000) / 10,
          difficulty_fit: Math.round(diffScore * 1000) / 10,
          duration_fit: Math.round(durationScore * 1000) / 10,
          popularity: Math.round(enrollScore * 1000) / 10
        },
        rag_explanation: `Recommended because it directly targets key skills (${matchedGapSkills.length ? matchedGapSkills.join(', ') : course.skills}). Offered by ${course.organization} with a high rating of ${course.ratings}/5.0 based on ${(course.review_count || 0).toLocaleString()} reviews. Level: ${course.difficulty} (${course.duration}).`
      };
    });

    // Rank by composite score
    scored.sort((a, b) => b.final_score - a.final_score);
    return scored.slice(0, top_k);
  }
}

module.exports = HybridRecommender;
