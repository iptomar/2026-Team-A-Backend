const express = require("express");
const router = express.Router();
const Form = require("../models/Form");

// Rota para criar (Rascunho) ou publicar formulário
router.post("/", async (req, res) => {
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
    res.status(500).json({ error: "Erro ao guardar o formulário." });
  }
});

module.exports = router;
