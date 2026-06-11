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

// Criar uma nova sala
exports.createSala = async (req, res) => {
  try {
    const novaSala = new Sala(req.body);
    await novaSala.save();
    res.status(201).json(novaSala);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar sala. Verifique se o nome já existe.' });
  }
};

// Seed de salas (para facilitar o teste inicial)
exports.seedSalas = async (req, res) => {
  const salasExemplo = [
    { 
      nome: 'B214', 
      bloco: 'B', 
      piso: '2', 
      tipo: 'Laboratório de Informática', 
      lotacao: 30,
      equipamentos: { projetor: true, tomadas: true }
    },
    { 
      nome: 'A102', 
      bloco: 'A', 
      piso: '1', 
      tipo: 'Sala de Aula Comum', 
      lotacao: 25,
      equipamentos: { projetor: true, tomadas: false }
    },
    { 
      nome: 'Auditório 1', 
      bloco: 'C', 
      piso: '0', 
      tipo: 'Anfiteatro', 
      lotacao: 120,
      equipamentos: { projetor: true, tomadas: true }
    },
    { 
      nome: 'D005', 
      bloco: 'D', 
      piso: '0', 
      tipo: 'Laboratório de Eletrónica', 
      lotacao: 20,
      equipamentos: { projetor: false, tomadas: true }
    },
  ];

  try {
    // Limpar salas existentes para o seed se solicitado ou se estiver vazio
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
