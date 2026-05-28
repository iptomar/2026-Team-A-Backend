const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Submissao = require('../models/Submissao');
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
    const { titulo, descricao, categoria, estado, campos, corPrincipal, logo } = req.body;
    
    const newForm = await Form.create({
      titulo,
      descricao,
      categoria: categoria || 'Sem categoria',
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

// Clonar um formulário existente
router.post('/:id/clonar', auth, async (req, res) => {
  try {
    const formOriginal = await Form.findById(req.params.id);
    if (!formOriginal) {
      return res.status(404).json({ error: 'Formulário original não encontrado.' });
    }

    // Criar um novo objeto baseado no original, mas com estado Rascunho e novo título
    const novoForm = new Form({
      titulo: `${formOriginal.titulo} (Cópia)`,
      descricao: formOriginal.descricao,
      categoria: formOriginal.categoria || 'Sem categoria',
      estado: 'Rascunho',
      campos: formOriginal.campos,
      corPrincipal: formOriginal.corPrincipal,
      logo: formOriginal.logo,
      criadoPor: req.userId
    });

    await novoForm.save();
    res.status(201).json(novoForm);
  } catch (err) {
    console.error('Erro ao clonar formulário:', err);
    res.status(500).json({ error: 'Erro ao clonar o formulário.' });
  }
});

// Atualizar um formulário
router.put('/:id', auth, async (req, res) => {
  try {
    const formAtual = await Form.findById(req.params.id);
    if (!formAtual) return res.status(404).json({ error: 'Formulário não encontrado.' });

    // Impede edição se estiver Publicado ou Arquivado
    if (formAtual.estado === 'Publicado' || formAtual.estado === 'Arquivado') {
      return res.status(403).json({ error: 'Não é possível editar formulários publicados ou arquivados.' });
    }
    const { titulo, descricao, categoria, estado, campos, corPrincipal, logo } = req.body;

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { titulo, descricao, categoria: categoria || 'Sem categoria', estado, campos, corPrincipal, logo },
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
    // PROTEÇÃO: Verificar se existem submissões pendentes
    const submissoesPendentes = await Submissao.countDocuments({ 
      formulario: req.params.id, 
      estado: 'Pendente' 
    });

    if (submissoesPendentes > 0) {
      return res.status(400).json({ 
        error: `Não é possível apagar este formulário porque existem ${submissoesPendentes} pedido(s) pendente(s).` 
      });
    }

    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json({ message: 'Formulário eliminado com sucesso.' });
  } catch (err) {
    console.error('Erro ao eliminar formulário:', err);
    res.status(500).json({ error: 'Erro ao eliminar o formulário.' });
  }
});

router.patch('/:id/arquivar', auth, async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { estado: 'Arquivado' },
      { new: true }
    );
    if (!form) return res.status(404).json({ error: 'Formulário não encontrado.' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao arquivar o formulário.' });
  }
});

module.exports = router;
