const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const DURATION_HOURS_ESTIMATE = {
  "less than 2 hours": 2,
  "1 - 4 weeks": 20,
  "1 - 3 months": 60,
  "3 - 6 months": 120
};

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't",
  "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
  "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
  "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
  "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

class HybridRecommender {
  constructor(metadataPath, embeddingsPath = null, faissPath = null) {
    this.metadataPath = metadataPath;
    this.embeddingsPath = embeddingsPath;
    this.faissPath = faissPath;

    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found at ${metadataPath}`);
    }

    const rawData = fs.readFileSync(metadataPath, 'utf-8');
    this.metadata = JSON.parse(rawData);

    // Compute max enrolled & review counts
    let maxEnrolled = 1.0;
    let maxReviews = 1.0;
    for (const item of this.metadata) {
      if (item.enrolled_count > maxEnrolled) maxEnrolled = item.enrolled_count;
      if (item.review_count > maxReviews) maxReviews = item.review_count;
    }
    this.maxEnrolled = maxEnrolled;
    this.maxReviews = maxReviews;
  }

  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  }

  computeSemanticSimilarityJS(queryStr) {
    const queryTokens = this.tokenize(queryStr);
    if (queryTokens.length === 0) {
      return new Array(this.metadata.length).fill(0.5);
    }

    const queryFreq = {};
    for (const t of queryTokens) {
      queryFreq[t] = (queryFreq[t] || 0) + 1;
    }

    const scores = [];
    for (let idx = 0; idx < this.metadata.length; idx++) {
      const item = this.metadata[idx];
      const titleTokens = this.tokenize(item.title);
      const skillTokens = this.tokenize(item.skills);
      const descTokens = this.tokenize(item.description);

      let matchScore = 0;
      let totalQueryWeight = 0;

      for (const [term, freq] of Object.entries(queryFreq)) {
        totalQueryWeight += freq;

        let termScore = 0;
        if (titleTokens.includes(term)) termScore += 0.5;
        if (skillTokens.includes(term)) termScore += 0.4;
        if (descTokens.includes(term)) termScore += 0.2;

        matchScore += termScore * freq;
      }

      const normalized = Math.min(matchScore / Math.max(totalQueryWeight * 0.5, 1), 1.0);
      scores.push(Number(normalized.toFixed(4)));
    }

    return scores;
  }

  recommend({
    current_skills = [],
    target_career_missing_skills = [],
    user_query = "",
    preferred_difficulty = "Any",
    preferred_duration = "Any",
    preferred_type = "Any",
    custom_weights = null,
    top_k = 10
  }) {
    const weights = { ...DEFAULT_WEIGHTS, ...(custom_weights || {}) };

    const targetMissing = (target_career_missing_skills || [])
      .map((s) => s.toLowerCase().trim())
      .filter((s) => s.length > 0);

    const userSkillsSet = new Set(
      current_skills.map((s) => s.toLowerCase().trim()).filter((s) => s.length > 0)
    );

    const combQuery = `${user_query} ${current_skills.join(' ')} ${targetMissing.join(' ')}`;
    const semanticScores = this.computeSemanticSimilarityJS(combQuery);

    const scores = [];

    for (let idx = 0; idx < this.metadata.length; idx++) {
      const row = this.metadata[idx];
      const courseSkillsRaw = row.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const courseSkillsLower = courseSkillsRaw.map((s) => s.toLowerCase());
      const courseSkillsSet = new Set(courseSkillsLower);

      // 1. Semantic Score
      const semScore = semanticScores[idx];

      // 2. Skill-Gap & Relevance Score
      let gapOverlap = 0;
      for (const s of courseSkillsSet) {
        if (targetMissing.includes(s)) gapOverlap++;
      }

      let userOverlap = 0;
      for (const s of courseSkillsSet) {
        if (userSkillsSet.has(s)) userOverlap++;
      }

      let gapScore = 0;
      if (targetMissing.length > 0) {
        gapScore =
          (gapOverlap / Math.max(targetMissing.length, 1)) * 0.7 +
          (userOverlap / Math.max(courseSkillsSet.size, 1)) * 0.3;
      } else {
        gapScore = userOverlap / Math.max(courseSkillsSet.size, 1);
      }
      gapScore = Math.min(gapScore, 1.0);

      // 3. Rating Score (Normalized 0.0 - 1.0)
      const ratingScore = Number(row.ratings) / 5.0;

      // 4. Difficulty Fit Score
      let diffScore = 1.0;
      if (preferred_difficulty && preferred_difficulty.toLowerCase() !== 'any') {
        const targetDiffVal = DIFFICULTY_MAP[preferred_difficulty.toLowerCase()] || 2;
        const courseDiffVal = DIFFICULTY_MAP[row.difficulty.toLowerCase()] || 2;
        const diffDiff = Math.abs(targetDiffVal - courseDiffVal);
        diffScore = Math.max(1.0 - diffDiff * 0.4, 0.1);
      }

      // 5. Duration Fit Score
      let durationScore = 1.0;
      if (preferred_duration && preferred_duration.toLowerCase() !== 'any') {
        const targetDurVal = DURATION_HOURS_ESTIMATE[preferred_duration.toLowerCase()] || 60;
        const courseDurVal = DURATION_HOURS_ESTIMATE[row.duration.toLowerCase()] || 60;
        const durDiff = Math.abs(targetDurVal - courseDurVal) / Math.max(targetDurVal, 1);
        durationScore = Math.max(1.0 - durDiff, 0.1);
      }

      // 6. Enrollment Popularity (Log-scaled)
      const enrollScore =
        Math.log1p(row.enrolled_count) / Math.log1p(this.maxEnrolled);

      // 7. Review Confidence (Log-scaled)
      const reviewScore =
        Math.log1p(row.review_count) / Math.log1p(this.maxReviews);

      // 8. Type Preference Score
      let typeScore = 1.0;
      if (preferred_type && preferred_type.toLowerCase() !== 'any') {
        typeScore = row.type.toLowerCase() === preferred_type.toLowerCase() ? 1.0 : 0.4;
      }

      // Weighted Composite Score
      const finalScore =
        weights.semantic_skill_match * semScore +
        weights.career_skill_gap_relevance * gapScore +
        weights.rating * ratingScore +
        weights.difficulty_fit * diffScore +
        weights.duration_fit * durationScore +
        weights.enrollment_popularity * enrollScore +
        weights.review_confidence * reviewScore +
        weights.type_preference * typeScore;

      // Identify matched skills
      const matchedGapSkills = courseSkillsRaw.filter((s) =>
        targetMissing.includes(s.toLowerCase())
      );

      scores.push({
        course_id: Number(row.vector_id),
        title: row.title,
        organization: row.organization,
        rating: row.ratings,
        review_count: row.review_count,
        enrolled_count: row.enrolled_count,
        difficulty: row.difficulty,
        duration: row.duration,
        type: row.type,
        course_url: row.course_url,
        skills: row.skills,
        matched_gap_skills: matchedGapSkills,
        final_score: Number(finalScore.toFixed(4)),
        score_breakdown: {
          semantic_match: Number((semScore * 100).toFixed(1)),
          skill_gap_relevance: Number((gapScore * 100).toFixed(1)),
          rating_quality: Number((ratingScore * 100).toFixed(1)),
          difficulty_fit: Number((diffScore * 100).toFixed(1)),
          duration_fit: Number((durationScore * 100).toFixed(1)),
          popularity: Number((enrollScore * 100).toFixed(1))
        },
        rag_explanation:
          `Recommended because it directly targets key skills (${matchedGapSkills.length > 0 ? matchedGapSkills.join(', ') : row.skills}). ` +
          `Offered by ${row.organization} with a high rating of ${row.ratings}/5.0 based on ${row.review_count.toLocaleString()} reviews. ` +
          `Level: ${row.difficulty} (${row.duration}).`
      });
    }

    scores.sort((a, b) => b.final_score - a.final_score);
    return scores.slice(0, top_k);
  }
}

module.exports = HybridRecommender;
