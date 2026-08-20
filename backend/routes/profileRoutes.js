const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticateUser = require('../middleware/authMiddleware');

router.get('/', authenticateUser, profileController.getProfile);
router.put('/', authenticateUser, profileController.updateProfile);
router.post('/assessment', authenticateUser, profileController.saveAssessment);
router.delete('/assessment/:id', authenticateUser, profileController.deleteAssessment);

module.exports = router;
