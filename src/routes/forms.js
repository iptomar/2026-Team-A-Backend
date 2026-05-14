const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const auth = require("../middlewares/auth");

// Rota para listar todos os formulários
router.get("/", async (req, res) => {
  try {
    const formularios = await Form.find().sort({ dataCriacao: -1 });
    res.json(formularios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao procurar formulários." });
  }
});

// Rota para ir buscar um formulário específico
router.get("/:id", async (req, res) => {
  try {
    const formulario = await Form.findById(req.params.id);
    if (!formulario) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }
    res.json(formulario);
  } catch (err) {
    res.status(500).json({ error: "Erro ao procurar o formulário." });
  }
});

// Rota para criar (Rascunho) ou publicar formulário
router.post("/", auth, async (req, res) => {
  try {
    const { titulo, descricao, estado, campos } = req.body;

    // Validação extra no servidor
    if (estado === "Publicado" && (!campos || campos.length === 0)) {
      return res
        .status(400)
        .json({ error: "Não é possível publicar sem campos." });
    }

    const novoForm = await Form.create({ titulo, descricao, estado, campos });
    res.status(201).json(novoForm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao guardar o formulário." });
  }
});

// Rota para atualizar um formulário
router.put("/:id", auth, async (req, res) => {
  try {
    const formAtual = await Form.findById(req.params.id);
    
    if (!formAtual) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    // Proteção: Rejeita se estiver Publicado
    if (formAtual.estado === "Publicado") {
      return res.status(403).json({ 
        error: "Não é possível alterar um formulário já publicado." 
      });
    }

    const formAtualizado = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(formAtualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar o formulário." });
  }
});

// Rota para apagar um formulário
router.delete("/:id", auth, async (req, res) => {
  try {
    const formAtual = await Form.findById(req.params.id);
    
    if (!formAtual) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    if (formAtual.estado === "Publicado") {
      return res.status(403).json({ 
        error: "Não é possível apagar um formulário publicado." 
      });
    }

    await Form.findByIdAndDelete(req.params.id);
    res.json({ message: "Formulário apagado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar o formulário." });
  }
});

module.exports = router;
