const datasetService = require('../services/datasetService');

function getDatasetStats(req, res) {
  try {
    const stats = datasetService.getDatasetStats();
    return res.json(stats);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: err.message
      });
    }

    console.error('Error in /api/dataset-stats:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

function getSkills(req, res) {
  try {
    const skills = datasetService.getSkills();
    return res.json(skills);
  } catch (err) {
    console.error('Error in /api/skills:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

function getEvaluation(req, res) {
  try {
    const report = datasetService.getEvaluationReport();
    return res.json(report);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: err.message
      });
    }

    console.error('Error in /api/evaluation:', err);
    return res.status(500).json({
      error: err.message
    });
  }
}

module.exports = {
  getDatasetStats,
  getSkills,
  getEvaluation
};
