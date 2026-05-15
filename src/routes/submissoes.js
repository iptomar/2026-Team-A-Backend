const express = require('express');
const router = express.Router();
const Submissao = require('../models/Submissao');
const auth = require('../middlewares/auth');

// Criar uma nova submissão
router.post('/', auth, async (req, res) => {
  try {
    const { formularioId, tituloFormulario, respostas } = req.body;
    
    const novaSubmissao = await Submissao.create({
      formulario: formularioId,
      professor: req.userId, // Corrigido para req.userId
      tituloFormulario,
      respostas,
      estado: 'Pendente'
    });

    res.status(201).json(novaSubmissao);
  } catch (error) {
    console.error('Erro ao criar submissão:', error);
    res.status(500).json({ error: 'Erro ao guardar a submissão.' });
  }
});

// Listar submissões do professor logado
router.get('/meus', auth, async (req, res) => {
  try {
    const pedidos = await Submissao.find({ professor: req.userId })
      .sort({ dataSubmissao: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar os seus pedidos.' });
  }
});

// Listar todas as submissões (para Admin)
router.get('/todos', auth, async (req, res) => {
  try {
    const pedidos = await Submissao.find()
      .populate('professor', 'email')
      .sort({ dataSubmissao: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar todos os pedidos.' });
  }
});

module.exports = router;
