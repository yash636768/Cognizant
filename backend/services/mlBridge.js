/**
 * mlBridge.js
 * -----------
 * Spawns `python ml/serve_recommender.py` as a child process,
 * passes the payload via stdin, and resolves with the parsed JSON
 * result from stdout.
 *
 * This is the ONLY place in the backend that calls Python — all
 * career-model logic stays in JS (careerModel.js); only the final
 * SentenceTransformer + FAISS scoring runs in Python.
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR   = path.resolve(__dirname, '..', '..');
const SCRIPT     = path.join(ROOT_DIR, 'ml', 'serve_recommender.py');

/**
 * Call the Python ML recommender.
 *
 * @param {Object} payload  - Same shape as HybridRecommender.recommend() kwargs:
 *   current_skills, target_career_missing_skills, user_query,
 *   preferred_difficulty, preferred_duration, preferred_type,
 *   custom_weights, top_k
 * @returns {Promise<Array>} Resolved with the recommendations array.
 */
function callPythonRecommender(payload) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [SCRIPT], {
      cwd: ROOT_DIR,
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      try {
        const parsed = JSON.parse(stdout);
        if (!parsed.success) {
          return reject(new Error(`Python recommender error: ${parsed.error}`));
        }
        return resolve(parsed.recommendations);
      } catch (parseErr) {
        return reject(
          new Error(
            `Failed to parse Python output.\nstdout: ${stdout}\nstderr: ${stderr}`
          )
        );
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });

    // Send payload to Python stdin and close the stream
    proc.stdin.write(JSON.stringify(payload));
    proc.stdin.end();
  });
}

module.exports = { callPythonRecommender };
