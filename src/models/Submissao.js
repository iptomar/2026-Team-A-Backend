const mongoose = require('mongoose');

const SubmissaoSchema = new mongoose.Schema({
  formulario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tituloFormulario: {
    type: String,
    required: true
  },
  respostas: {
    type: Map,
    of: String
  },
  estado: {
    type: String,
    enum: ['Pendente', 'Aprovado', 'Rejeitado'],
    default: 'Pendente'
  },
  justificacaoRejeicao: {
    type: String
  },
  dataSubmissao: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Submissao', SubmissaoSchema);
