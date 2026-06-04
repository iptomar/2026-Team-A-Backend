const Sala = require('../models/Sala');

// Obter todas as salas
exports.getSalas = async (req, res) => {
  try {
    const salas = await Sala.find();
    res.json(salas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar salas.' });
  }
};

// Seed de salas (para facilitar o teste inicial)
exports.seedSalas = async (req, res) => {
  const salasExemplo = [
    { nome: 'A1.01', bloco: 'A', piso: '1', capacidade: 30 },
    { nome: 'A1.02', bloco: 'A', piso: '1', capacidade: 25 },
    { nome: 'B2.01', bloco: 'B', piso: '2', capacidade: 40 },
    { nome: 'B2.02', bloco: 'B', piso: '2', capacidade: 35 },
    { nome: 'C0.01 (Auditório)', bloco: 'C', piso: '0', capacidade: 120 },
    { nome: 'Laboratório L1', bloco: 'D', piso: '1', capacidade: 20 },
  ];

  try {
    const count = await Sala.countDocuments();
    if (count === 0) {
      await Sala.insertMany(salasExemplo);
      return res.json({ message: 'Salas inseridas com sucesso!' });
    }
    res.json({ message: 'A base de dados já contém salas.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inserir salas.' });
  }
};
