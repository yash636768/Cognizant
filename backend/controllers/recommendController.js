const recommendService = require('../services/recommendService');

async function recommend(req, res) {
  try {
    const result = await recommendService.generateRecommendations(req.body || {});
    return res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Error in /api/recommend:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { recommend };
