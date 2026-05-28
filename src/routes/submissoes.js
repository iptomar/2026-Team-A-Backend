const express = require('express');
const router = express.Router();
const Submissao = require('../models/Submissao');
const User = require('../models/User');
const Form = require('../models/Form');
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
    console.log('GET /api/submissoes/todos - Utilizador:', req.userId);
    const pedidos = await Submissao.find()
      .populate('professor', 'email')
      .sort({ dataSubmissao: 1 });
    console.log(`Encontradas ${pedidos.length} submissões.`);
    res.json(pedidos);
  } catch (error) {
    console.error('ERRO CRÍTICO em /api/submissoes/todos:', error);
    res.status(500).json({ 
      error: 'Erro ao procurar todos os pedidos.',
      details: error.message 
    });
  }
});

// Obter detalhes de uma submissão específica
router.get('/:id', auth, async (req, res) => {
  try {
    const submissao = await Submissao.findById(req.params.id)
      .populate('formulario')
      .populate('professor', 'email')
      .lean();
    
    if (!submissao) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // Verificar se o utilizador tem permissão (é o professor que submeteu ou é admin)
    // Nota: assumindo que o middleware 'auth' define req.userId e req.userRole (se houver)
    // Se não tiver req.userRole, podemos simplificar por agora ou verificar o User model
    
    res.json(submissao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar detalhes do pedido.' });
  }
});

// Atualizar o estado de uma submissão (Aprovar/Rejeitar)
router.patch('/:id/estado', auth, async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!['Aprovado', 'Rejeitado', 'Pendente'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    const submissao = await Submissao.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).populate('formulario').populate('professor', 'email');

    if (!submissao) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json(submissao);
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    res.status(500).json({ error: 'Erro ao atualizar o estado do pedido.' });
  }
});

module.exports = router;
