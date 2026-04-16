const express = require('express');
const router = express.Router();
const Formulario = require('../models/Form');

// Rota para criar formulário (POST /forms)
router.post('/', async (req, res) => {
  try {
    const novoForm = new Formulario(req.body);
    await novoForm.save();
    res.status(201).json(novoForm);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao guardar formulário', detalhe: err.message });
  }
});

// Rota para listar todos os formulários (GET /forms)
router.get('/', async (req, res) => {
  try {
    const formularios = await Formulario.find();
    res.json(formularios);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar formulários', detalhe: err.message });
  }
});

// Rota para buscar um formulário por ID (GET /forms/:id)
router.get('/:id', async (req, res) => {
  try {
    const formulario = await Formulario.findById(req.params.id);
    if (!formulario) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }
    res.json(formulario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar formulário', detalhe: err.message });
  }
});

// Rota para atualizar um formulário (PUT /forms/:id)
router.put('/:id', async (req, res) => {
  try {
    const formulario = await Formulario.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!formulario) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }
    res.json(formulario);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar formulário', detalhe: err.message });
  }
});

// Rota para deletar um formulário (DELETE /forms/:id)
router.delete('/:id', async (req, res) => {
  try {
    const formulario = await Formulario.findByIdAndDelete(req.params.id);
    if (!formulario) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }
    res.json({ message: 'Formulário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar formulário', detalhe: err.message });
  }
});

module.exports = router;