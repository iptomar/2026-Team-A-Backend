const mongoose = require('mongoose');

const CampoSchema = new mongoose.Schema({
  etiqueta: { type: String, required: true },
  tipo: { type: String, required: true },
  obrigatorio: { type: Boolean, default: false },
  x: { type: Number, default: 1 },
  y: { type: Number, default: 1 },
  w: { type: Number, default: 12 },
  maxCaracteres: { type: Number }, // Tamanho máximo de caracteres para texto
  minNumero: { type: Number },     // Valor mínimo permitido para números
  maxNumero: { type: Number }      // Valor máximo permitido para números
});

const FormSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  categoria: { type: String, trim: true, default: 'Sem categoria' },
  estado: { type: String, enum: ['Rascunho', 'Publicado', 'Arquivado'], default: 'Rascunho' },
  campos: [CampoSchema],
  corPrincipal: { type: String, default: '#282c34' },
  logo: { type: String },
  codigoDocumento: { type: String, default: 'PT.SIGQ.MOD ACA 30 60 - 3' },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  criadoEm: { type: Date, default: Date.now },
  publicoAlvo: { type: String, enum: ['Todos', 'Docentes', 'Alunos'], default: 'Todos' },
  cursosDestinatarios: [{ type: String }]
});


module.exports = mongoose.model('Form', FormSchema);
