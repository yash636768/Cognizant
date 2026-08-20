const recommendService = require('../services/recommendService');

function recommend(req, res) {
  try {
    const result = recommendService.generateRecommendations(req.body || {});
    return res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: err.message
      });
    }

    console.error('Error in /api/recommend:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

module.exports = {
  recommend
};
