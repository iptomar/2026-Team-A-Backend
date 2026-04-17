const mongoose = require('mongoose');

const FormularioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  estado: { 
    type: String, 
    default: 'Rascunho', 
    enum: ['Rascunho', 'Publicado', 'Inativo'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Formulario', FormularioSchema);