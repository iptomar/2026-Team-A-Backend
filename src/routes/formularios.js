const express = require('express');
const router = express.Router();
const Formulario = require('../models/Formulario');
const auth = require('../middlewares/auth'); 

// Rota para APAGAR (DELETE)
router.delete('/:id', auth, async (req, res) => {
  try {
    // 1. Vai buscar o formulário antes de o apagar
    const formAtual = await Formulario.findById(req.params.id);
    
    if (!formAtual) {
      return res.status(404).json({ erro: 'Formulário não encontrado' });
    }

    // 2. PROTEÇÃO: Rejeita se estiver Publicado
    if (formAtual.estado === 'Publicado') {
      return res.status(403).json({ 
        erro: 'Ação bloqueada. Não é possível apagar ou alterar a estrutura de um formulário publicado.' 
      });
    }

    // 3. Se for Rascunho ou Inativo, prossegue com a remoção
    await Formulario.findByIdAndDelete(req.params.id);
    res.json({ mensagem: 'Formulário apagado com sucesso' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Rota para ATUALIZAR/EDITAR (PUT)
router.put('/:id', auth, async (req, res) => {
  try {
    // 1. Vai buscar o formulário existente antes de permitir a edição
    const formAtual = await Formulario.findById(req.params.id);
    
    if (!formAtual) {
      return res.status(404).json({ erro: 'Formulário não encontrado' });
    }

    // 2. PROTEÇÃO: Rejeita se estiver Publicado
    if (formAtual.estado === 'Publicado') {
      return res.status(403).json({ 
        erro: 'Ação bloqueada. Não é possível alterar a estrutura de um formulário já publicado.' 
      });
    }

    // 3. Se for Rascunho, permite gravar as alterações
    const formAtualizado = await Formulario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devolve os dados já com a alteração aplicada
    );
    
    res.json(formAtualizado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;