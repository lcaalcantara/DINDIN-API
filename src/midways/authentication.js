const jwtPassword = require('../jwtPassword');
const jwt = require('jsonwebtoken');
const pool = require('../conection')

const authenticateUser = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
    };

    const token = authorization.split(' ')[1]

    try {
        const { id } = jwt.verify(token, jwtPassword);

        const { rows, rowCount } = await pool.query(
            'select * from usuarios where id = $1',
            [id]
        );

        if (rowCount < 1) {
            return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
        };

        req.usuario = rows[0];

        next()
    } catch (error) {
        return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' })
    }
};

module.exports = authenticateUser