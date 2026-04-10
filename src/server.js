require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares base
app.use(cors()); // Permite que o Frontend React aceda à API
app.use(express.json()); // Permite ler JSON no corpo das requisições

// Rotas
app.use('/auth', authRoutes);

// Rota de teste para verificar se o servidor está online
app.get('/', (req, res) => {
    res.send('Backend Online - 2026 Team A');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});