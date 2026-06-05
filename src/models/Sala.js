const mongoose = require('mongoose');

const SalaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  bloco: { type: String, required: true },
  piso: { type: String, required: true },
  tipo: { type: String, required: true }, // ex: "Laboratório de Informática", "Anfiteatro"
  lotacao: { type: Number, required: true },
  equipamentos: {
    projetor: { type: Boolean, default: false },
    tomadas: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Sala', SalaSchema);
