const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Substituir por conexão real a BD depois -- falta criar
const users = []; 

/* ISTO SÃO ROTAS DE TESTE */

// Rota de Registo (para criares o teu primeiro utilizador)
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 8);
        
        const newUser = { id: Date.now(), email, password: hashedPassword };
        users.push(newUser);
        
        res.status(201).send({ message: 'Utilizador criado!' });
    } catch (err) {
        res.status(400).send({ error: 'Erro no registo' });
    }
});

// Rota de Login (Gera o Token de Sessão solicitado na tarefa)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Procura utilizador na memória
    const user = users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ error: 'Credenciais inválidas' });
    }

    // Gera o token (usa a chave do teu ficheiro .env)
    const token = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET || 'chave_mestra_secreta', 
        { expiresIn: '1d' }
    );

    res.send({ user: { email: user.email }, token });
});

module.exports = router;