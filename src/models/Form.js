const mongoose = require("mongoose");
const FormSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  estado: {
    type: String,
    enum: ["Rascunho", "Publicado"],
    default: "Rascunho",
  },
  campos: [
    {
      etiqueta: { type: String, required: true },
      tipo: { type: String, required: true },
      obrigatorio: { type: Boolean, default: false },
      detalhesData: {
        tipoAlteracao: { type: String },
        data: { type: String },
      },
    },
  ],
  dataCriacao: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", FormSchema);
