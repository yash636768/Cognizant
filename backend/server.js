const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const CareerModel = require('./careerModel');
const HybridRecommender = require('./recommender');

const app = express();
app.use(cors());
app.use(express.json());

const BASE_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'data', 'processed');
const MODELS_DIR = path.join(BASE_DIR, 'models');

const META_PATH = path.join(MODELS_DIR, 'vector_index', 'course_metadata.json');
const EMB_PATH = path.join(MODELS_DIR, 'embeddings', 'course_embeddings.npy');
const FAISS_PATH = path.join(MODELS_DIR, 'vector_index', 'course_faiss.index');
const TAXONOMY_PATH = path.join(DATA_DIR, 'skill_taxonomy.json');
const EVAL_PATH = path.join(MODELS_DIR, 'evaluation', 'eval_report.json');

// Initialize Models
const careerModel = new CareerModel(TAXONOMY_PATH);
let recommender = null;

function getRecommender() {
  if (!recommender && fs.existsSync(META_PATH)) {
    recommender = new HybridRecommender(META_PATH, EMB_PATH, FAISS_PATH);
  }
  return recommender;
}

// 1. GET /api/dataset-stats
app.get('/api/dataset-stats', (req, res) => {
  if (!fs.existsSync(META_PATH)) {
    return res.status(404).json({ error: "Dataset metadata not generated yet" });
  }

  try {
    const rawMeta = fs.readFileSync(META_PATH, 'utf-8');
    const metadata = JSON.parse(rawMeta);

    const totalCourses = metadata.length;
    const orgsSet = new Set(metadata.map((m) => m.organization));
    const ratings = metadata.map((m) => Number(m.ratings));
    const ratingsSum = ratings.reduce((acc, curr) => acc + curr, 0);
    const ratingsMean = Number((ratingsSum / Math.max(ratings.length, 1)).toFixed(2));

    let totalSkills = 0;
    if (fs.existsSync(TAXONOMY_PATH)) {
      const rawTax = fs.readFileSync(TAXONOMY_PATH, 'utf-8');
      const tax = JSON.parse(rawTax);
      totalSkills = tax.length;
    }

    return res.json({
      dataset_name: "coursera_course_dataset_v3.csv",
      total_courses: totalCourses,
      total_skills_identified: totalSkills,
      total_organizations: orgsSet.size,
      ratings_mean: ratingsMean,
      top_organizations: Array.from(orgsSet).slice(0, 15)
    });
  } catch (err) {
    console.error("Error in /api/dataset-stats:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/skills
app.get('/api/skills', (req, res) => {
  if (!fs.existsSync(TAXONOMY_PATH)) {
    return res.json([]);
  }
  try {
    const rawTax = fs.readFileSync(TAXONOMY_PATH, 'utf-8');
    const tax = JSON.parse(rawTax);
    return res.json(tax);
  } catch (err) {
    console.error("Error in /api/skills:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/evaluation
app.get('/api/evaluation', (req, res) => {
  if (!fs.existsSync(EVAL_PATH)) {
    return res.status(404).json({ error: "Evaluation report not generated yet" });
  }
  try {
    const rawEval = fs.readFileSync(EVAL_PATH, 'utf-8');
    const report = JSON.parse(rawEval);
    return res.json(report);
  } catch (err) {
    console.error("Error in /api/evaluation:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/recommend
app.post('/api/recommend', (req, res) => {
  const recEngine = getRecommender();
  if (!recEngine) {
    return res.status(500).json({ error: "Recommendation index not ready" });
  }

  try {
    const data = req.body || {};
    const currentSkills = data.current_skills || [];
    const targetCareer = data.target_career || "";
    const userQuery = data.user_query || "";
    const preferredDifficulty = data.preferred_difficulty || "Any";
    const preferredDuration = data.preferred_duration || "Any";
    const preferredType = data.preferred_type || "Any";
    const customWeights = data.custom_weights || null;
    const topK = parseInt(data.top_k || 10, 10);

    // 1. Career Trajectory Matching
    const interestText = `${targetCareer} ${userQuery}`.trim();
    const careerEvals = careerModel.evaluateCareers(currentSkills, interestText);

    let selectedCareerProfile = null;
    let targetMissingSkills = [];

    if (targetCareer) {
      for (const c of careerEvals) {
        if (
          c.title.toLowerCase() === targetCareer.toLowerCase() ||
          c.career_key.toLowerCase() === targetCareer.toLowerCase()
        ) {
          selectedCareerProfile = c;
          targetMissingSkills = c.missing_core_skills.concat(c.missing_supp_skills);
          break;
        }
      }
    }

    if (!selectedCareerProfile && careerEvals.length > 0) {
      selectedCareerProfile = careerEvals[0];
      targetMissingSkills = selectedCareerProfile.missing_core_skills.concat(
        selectedCareerProfile.missing_supp_skills
      );
    }

    // 2. Hybrid Recommendation Scoring
    const recs = recEngine.recommend({
      current_skills: currentSkills,
      target_career_missing_skills: targetMissingSkills,
      user_query: userQuery || (selectedCareerProfile ? selectedCareerProfile.title : ""),
      preferred_difficulty: preferredDifficulty,
      preferred_duration: preferredDuration,
      preferred_type: preferredType,
      custom_weights: customWeights,
      top_k: topK
    });

    return res.json({
      dataset_grounding: "Powered by Hackathon Dataset (coursera_course_dataset_v3.csv)",
      career_candidates: careerEvals,
      selected_career: selectedCareerProfile,
      target_missing_skills: targetMissingSkills,
      recommendations: recs
    });
  } catch (err) {
    console.error("Error in /api/recommend:", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js Express Server running at http://localhost:${PORT}`);
});
