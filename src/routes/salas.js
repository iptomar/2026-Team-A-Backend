const express = require('express');
const router = express.Router();
const salasController = require('../controllers/salasController');

router.get('/', salasController.getSalas);
router.post('/seed', salasController.seedSalas);

module.exports = router;
