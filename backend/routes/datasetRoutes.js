const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');

router.get('/dataset-stats', datasetController.getDatasetStats);
router.get('/skills', datasetController.getSkills);
router.get('/evaluation', datasetController.getEvaluation);

module.exports = router;
