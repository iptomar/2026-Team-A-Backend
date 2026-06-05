const express = require('express');
const router = express.Router();
const salasController = require('../controllers/salasController');
const authMiddleware = require('../middlewares/auth');

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }
  next();
};

router.get('/', salasController.getSalas);
router.post('/', authMiddleware, isAdmin, salasController.createSala);
router.post('/seed', salasController.seedSalas);

module.exports = router;
