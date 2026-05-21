const mongoose = require('mongoose');

const SubmissaoSchema = new mongoose.Schema({
  formulario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formulario',
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
  dataSubmissao: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Submissao', SubmissaoSchema);
