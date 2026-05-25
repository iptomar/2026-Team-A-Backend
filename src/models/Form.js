const mongoose = require('mongoose');

const CampoSchema = new mongoose.Schema({
  etiqueta: { type: String, required: true },
  tipo: { type: String, required: true },
  obrigatorio: { type: Boolean, default: false }
});

const FormSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  estado: { type: String, enum: ['Rascunho', 'Publicado', 'Arquivado'], default: 'Rascunho' },
  campos: [CampoSchema],
  corPrincipal: { type: String, default: '#282c34' },
  logo: { type: String }, // Store as Base64 string for simplicity in this task
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
