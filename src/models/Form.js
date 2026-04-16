const mongoose = require('mongoose');

const CampoSchema = new mongoose.Schema({
  etiqueta: { type: String, required: true },
  tipo: { type: String, required: true }, // "Texto Curto", "Texto Longo", "Número", etc.
  // Novos metadados para a Issue #17
  min_value: { type: Number },      // Apenas se tipo for Número
  max_value: { type: Number },      // Apenas se tipo for Número
  char_limit: { type: Number }      // Apenas se tipo for Texto
});

// Validação personalizada para campos
CampoSchema.pre('save', function(next) {
  if (this.tipo === 'Número') {
    if (this.min_value !== undefined && this.max_value !== undefined) {
      if (this.min_value >= this.max_value) {
        return next(new Error('min_value deve ser menor que max_value para campos do tipo Número'));
      }
    }
  } else if (this.tipo.includes('Texto')) {
    if (this.char_limit !== undefined && this.char_limit <= 0) {
      return next(new Error('char_limit deve ser um número positivo para campos do tipo Texto'));
    }
  }
  next();
});

const FormularioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  estado: { type: String, default: 'Rascunho' },
  campos: [CampoSchema] // Array de campos com as validações
}, { timestamps: true });

module.exports = mongoose.model('Formulario', FormularioSchema);