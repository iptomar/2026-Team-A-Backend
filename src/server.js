require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Importar o Mongoose
const authRoutes = require('./routes/auth');
const formulariosRoutes = require('./routes/formularios');

const app = express();

// Middlewares base
app.use(cors()); // Permite que o Frontend React aceda à API
app.use(express.json()); // Permite ler JSON no corpo das requisições

// 1. Configurar a ligação ao MongoDB
// A URI deve estar no teu ficheiro .env para segurança
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:2026/team_a_db';

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado ao MongoDB com sucesso!'))
    .catch(err => {
        console.error('Erro ao ligar ao MongoDB:', err.message);
        process.exit(1); // Fecha o servidor se não conseguir ligar à base de dados
    });

// Rotas
app.use('/auth', authRoutes);
app.use('/api/formularios', formulariosRoutes);

// Rota de teste para verificar se o servidor está online
app.get('/', (req, res) => {
    res.send('Backend Online - 2026 Team A com MongoDB');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});