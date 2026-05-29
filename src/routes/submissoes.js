const express = require('express');
const router = express.Router();
const submissoesController = require('../controllers/submissoesController');
const auth = require('../middlewares/auth');

router.post('/', auth, submissoesController.create);
router.get('/meus', auth, submissoesController.listMySubmissions);
router.get('/todos', auth, submissoesController.listAll);
router.get('/estatisticas', auth, submissoesController.getStats);
router.get('/ocupacao', auth, submissoesController.getOccupancy);
router.get('/:id', auth, submissoesController.getById);
router.patch('/:id/estado', auth, submissoesController.updateStatus);

module.exports = router;
