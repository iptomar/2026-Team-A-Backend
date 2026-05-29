const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Este e-mail já está registado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        
        const newUser = await User.create({ 
            email, 
            password: hashedPassword,
            role: role || 'professor' 
        });
        
        res.status(201).json({ message: 'Utilizador criado com sucesso!', id: newUser._id });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao registar o utilizador.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'E-mail ou palavra-passe incorretos.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

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
};
