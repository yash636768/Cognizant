const fs = require('fs');
const { spawn } = require('child_process');

class HybridRecommender {
  constructor(metadataPath, embeddingsPath, faissPath, pythonPath, scriptPath) {
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found at ${metadataPath}`);
    }
    if (!fs.existsSync(embeddingsPath)) {
      throw new Error(`Embeddings file not found at ${embeddingsPath}`);
    }
    if (!fs.existsSync(faissPath)) {
      throw new Error(`FAISS index not found at ${faissPath}`);
    }
    if (!fs.existsSync(pythonPath)) {
      throw new Error(`Python executable not found at ${pythonPath}. Set PYTHON_PATH to your ML environment.`);
    }
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`ML recommender script not found at ${scriptPath}`);
    }

    this.metadataPath = metadataPath;
    this.embeddingsPath = embeddingsPath;
    this.faissPath = faissPath;
    this.pythonPath = pythonPath;
    this.scriptPath = scriptPath;
    this.pending = [];
    this.ready = false;
    this.startupError = null;
    this.outputBuffer = '';
    this.worker = spawn(this.pythonPath, [this.scriptPath, '--worker'], {
      cwd: require('path').dirname(this.scriptPath),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.worker.stdout.setEncoding('utf8');
    this.worker.stderr.setEncoding('utf8');
    this.worker.stdout.on('data', data => this._handleOutput(data));
    this.worker.stderr.on('data', data => {
      process.stderr.write(`[ML worker] ${data}`);
    });
    this.worker.on('error', error => this._failWorker(error));
    this.worker.on('close', code => {
      if (code !== 0) {
        this._failWorker(new Error(`ML worker exited with code ${code}`));
      }
    });

    this.worker.stdin.write(`${JSON.stringify({
      metadata_path: this.metadataPath,
      embeddings_path: this.embeddingsPath,
      faiss_path: this.faissPath
    })}\n`);
  }

  recommend(options = {}) {
    return new Promise((resolve, reject) => {
      if (this.startupError) {
        reject(this.startupError);
        return;
      }
      this.pending.push({ options, resolve, reject });
      this._drainQueue();
    });
  }

  _handleOutput(data) {
    this.outputBuffer += data;
    const lines = this.outputBuffer.split('\n');
    this.outputBuffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        this._failWorker(new Error(`ML worker returned invalid JSON: ${error.message}`));
        return;
      }

      if (message.ready) {
        this.ready = true;
        this._drainQueue();
        continue;
      }

      const request = this.pending.shift();
      if (!request) continue;
      if (message.error) request.reject(new Error(message.error));
      else request.resolve(message.result);
      this._drainQueue();
    }
  }

  _drainQueue() {
    if (!this.ready || !this.pending.length || this.startupError) return;
    const request = this.pending[0];
    this.worker.stdin.write(`${JSON.stringify(request.options)}\n`);
  }

  _failWorker(error) {
    if (this.startupError) return;
    this.startupError = error;
    while (this.pending.length) this.pending.shift().reject(error);
  }
}

module.exports = HybridRecommender;
