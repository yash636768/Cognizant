const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

class HybridRecommender {
  constructor(metadataPath, embeddingsPath = null, faissPath = null) {
    // Node keeps the backend API simple while Python owns the ML scoring.
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found at ${metadataPath}`);
    }

    this.metadataPath = metadataPath;
    this.embeddingsPath = embeddingsPath;
    this.faissPath = faissPath;
    this.pythonScriptPath = path.resolve(__dirname, '..', 'ml', 'hybrid_recommender.py');
    this.pythonCommand = process.env.PYTHON_BIN || 'python3';
  }

  recommend(options = {}) {
    // Send model paths and user preferences to the Python recommender as JSON.
    const payload = JSON.stringify({
      metadata_path: this.metadataPath,
      embeddings_path: this.embeddingsPath,
      faiss_path: this.faissPath,
      current_skills: [],
      target_career_missing_skills: [],
      user_query: '',
      preferred_difficulty: 'Any',
      preferred_duration: 'Any',
      preferred_type: 'Any',
      custom_weights: null,
      top_k: 10,
      ...options
    });

    try {
      // Run one Python process and read its JSON recommendation response.
      const output = execFileSync(this.pythonCommand, [this.pythonScriptPath], {
        input: payload,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        maxBuffer: 20 * 1024 * 1024
      });

      return JSON.parse(output);
    } catch (error) {
      throw new Error(`ML recommendation failed: ${error.message}`);
    }
  }
}

module.exports = HybridRecommender;
