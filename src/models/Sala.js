const mongoose = require('mongoose');

const SalaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  bloco: { type: String, required: true },
  piso: { type: String, required: true },
  capacidade: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sala', SalaSchema);
