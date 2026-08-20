const path = require('path');
const fs = require('fs');

const BASE_DIR = path.resolve(__dirname, '..', '..');

const DATA_DIR = path.join(BASE_DIR, 'data', 'processed');
const MODELS_DIR = path.join(BASE_DIR, 'models');
const USER_PROFILES_DIR = path.join(BASE_DIR, 'data');

const USER_PROFILES_PATH = path.join(USER_PROFILES_DIR, 'user_profiles.json');
const META_PATH = path.join(MODELS_DIR, 'vector_index', 'course_metadata.json');
const EMB_PATH = path.join(MODELS_DIR, 'embeddings', 'course_embeddings.npy');
const FAISS_PATH = path.join(MODELS_DIR, 'vector_index', 'course_faiss.index');
const TAXONOMY_PATH = path.join(DATA_DIR, 'skill_taxonomy.json');
const EVAL_PATH = path.join(MODELS_DIR, 'evaluation', 'eval_report.json');

// Initialize user profiles directory & file if they don't exist
if (!fs.existsSync(USER_PROFILES_DIR)) {
  fs.mkdirSync(USER_PROFILES_DIR, { recursive: true });
}

if (!fs.existsSync(USER_PROFILES_PATH)) {
  fs.writeFileSync(USER_PROFILES_PATH, JSON.stringify({}, null, 2));
}

module.exports = {
  BASE_DIR,
  DATA_DIR,
  MODELS_DIR,
  USER_PROFILES_DIR,
  USER_PROFILES_PATH,
  META_PATH,
  EMB_PATH,
  FAISS_PATH,
  TAXONOMY_PATH,
  EVAL_PATH
};
