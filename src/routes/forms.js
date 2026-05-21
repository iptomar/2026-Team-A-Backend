const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const auth = require('../middlewares/auth');

// Listar todos os formulários
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ criadoEm: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar formulários.' });
  }
});

// Obter um formulário específico
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar o formulário.' });
  }
});

// Criar um novo formulário
router.post('/', auth, async (req, res) => {
  try {
    const { titulo, descricao, estado, campos, corPrincipal, logo } = req.body;
    
    const newForm = await Form.create({
      titulo,
      descricao,
      estado,
      campos,
      corPrincipal,
      logo,
      criadoPor: req.userId
    });
    
    res.status(201).json(newForm);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar o formulário.' });
  }
});

// Atualizar um formulário
router.put('/:id', auth, async (req, res) => {
    try {
      const { titulo, descricao, estado, campos, corPrincipal, logo } = req.body;
      
      const form = await Form.findByIdAndUpdate(
        req.params.id,
        { titulo, descricao, estado, campos, corPrincipal, logo },
        { new: true }
      );
      
      if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
      
      res.json(form);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar o formulário.' });
    }
  });

// Eliminar um formulário
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json({ message: 'Formulário eliminado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao eliminar o formulário.' });
  }
});

module.exports = router;
