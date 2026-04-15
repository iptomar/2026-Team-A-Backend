const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 

// Rota de Registo - Agora guarda no MongoDB real
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1. Verifica se o utilizador já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Este e-mail já está registado.' });
        }

        // 2. Encripta a password
        const hashedPassword = await bcrypt.hash(password, 8);
        
        // 3. Cria e guarda na base de dados
        const newUser = await User.create({ 
            email, 
            password: hashedPassword,
            role: role || 'professor' 
        });
        
        res.status(201).json({ message: 'Utilizador criado com sucesso!', id: newUser._id });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao registar o utilizador.' });
    }
});

// Rota de Login - Lógica de autenticação completa
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Procura o utilizador no MongoDB Atlas
        const user = await User.findOne({ email });
        
        // 2. Valida existência e password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'E-mail ou palavra-passe incorretos.' });
        }

        // 3. Gera o Token de Sessão solicitado na tarefa #11
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Expira em 1 dia
        );

        // 4. Envia resposta para o Frontend
        res.json({ 
            user: { 
                email: user.email, 
                role: user.role 
            }, 
            token 
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor durante o login.' });
    }
});

module.exports = router;