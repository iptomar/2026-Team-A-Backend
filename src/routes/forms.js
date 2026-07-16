const express = require('express');
const router = express.Router();
const formsController = require('../controllers/formsController');
const auth = require('../middlewares/auth');

router.get('/', auth, formsController.listAll);
router.get('/:id', formsController.getById);
router.post('/', auth, formsController.create);
router.post('/:id/clonar', auth, formsController.clone);
router.put('/:id', auth, formsController.update);
router.delete('/:id', auth, formsController.delete);
router.patch('/:id/arquivar', auth, formsController.archive);
router.patch('/:id/despublicar', auth, formsController.unpublish);
router.patch('/:id/publicar', auth, formsController.publish);

module.exports = router;
