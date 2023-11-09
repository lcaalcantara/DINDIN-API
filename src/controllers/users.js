const bcrypt = require('bcrypt');
const pool = require('../conection');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../jwtPassword');

const signup = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Os campos nome, email e senha são obrigatórios' })
    }

    try {
        const emailExists = await pool.query('select * from usuarios where email = $1', [email]);

        if (emailExists.rowCount > 0) {
            return res.status(400).json({ mensagem: 'O email informado já existe' });
        };

        const hashPassword = await bcrypt.hash(senha, 10);

        const query = `
        insert into usuarios (nome, email, senha)
        values ($1, $2, $3) returning *
        `

        const { rows } = await pool.query(query, [nome, email, hashPassword]);

        const { senha: _, ...usuario } = rows[0];

        return res.status(201).json(usuario);

    } catch (error) {

        return res.status(500).json({ mensagem: 'Erro interno do servidor' });

    };
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
    };

    try {
        const validUser = await pool.query(
            'select * from usuarios where email = $1',
            [email]
        );

        if (validUser.rowCount < 1) {
            return res.status(403).json({ mensagem: 'Email ou senha inválidos' });
        };

        const validPassword = await bcrypt.compare(senha, validUser.rows[0].senha);

        if (!validPassword) {
            return res.status(403).json({ mensagem: 'Email ou senha inválidos' });
        }

        const token = jwt.sign({ id: validUser.rows[0].id }, senhaJwt, { expiresIn: '8h' })

        const { senha: _, ...usuario } = validUser.rows[0]

        return res.status(200).json({ usuario, token })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const detailUser = async (req, res) => {
    const { id, nome, email } = req.usuario

    try {
        return res.json({ id, nome, email })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const updateUser = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.usuario;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios' });
    }

    try {
        const { rows } = await pool.query(
            'select * from usuarios where id = $1',
            [id]
        );

        const validEmail = await pool.query(
            'select * from usuarios where email = $1',
            [email]
        );

        if (validEmail.rowCount > 0 && rows[0].email !== email) {
            return res.status(400).json({ mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.' });
        };

        const hashPassword = await bcrypt.hash(senha, 10);

        const query = `
        update usuarios
        set (nome, email, senha) = ($1,$2,$3)
        where id = $4;
        `

        pool.query(query, [nome, email, hashPassword, id])

        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor', error });
    }
};

module.exports = ({
    signup,
    login,
    detailUser,
    updateUser
});