const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middlewares/auth');

router.get('/visual', settingsController.getVisualSettings);
router.put('/visual', auth, settingsController.updateVisualSettings);

module.exports = router;
