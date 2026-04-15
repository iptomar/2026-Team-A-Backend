const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o header existe
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    // 2. Verifica o formato: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no token. Formato inválido.' });
    }

    const [scheme, token] = parts;

    // A regex garante que a palavra "Bearer" está lá, ignorando maiúsculas/minúsculas
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token malformatado. Use o prefixo Bearer.' });
    }

    // 3. Validação final do JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        // Importante: Guarda o ID do utilizador no objeto da requisição
        // Assim, as próximas funções sabem quem está a fazer o pedido
        req.userId = decoded.id;
        
        return next(); // Passa para a próxima função/rota
    });
};