const pool = require('../conection');

const createTransaction = async (req, res) => {
    const { tipo, descricao, valor, categoria_id } = req.body;
    const { id } = req.usuario;
    const data = new Date().toJSON();

    try {
        const searchCategory = await pool.query(
            'select descricao from categorias where id = $1',
            [categoria_id]
        );

        const categoryName = pesquisarCategoria.rows[0].descricao;

        const query =
            `insert into transacoes (tipo, descricao, valor, data, categoria_id, usuario_id)
            values ($1, $2, $3, $4, $5, $6) returning *`
        const params = [tipo, descricao, valor, data, categoria_id, id]


        const { rows } = await pool.query(query, params);

        const response = { ...rows[0], categoria_nome: categoryName }

        return res.status(201).json(response);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const listTransactions = async (req, res) => {
    const { id } = req.usuario

    try {
        const categories = await pool.query('select * from categorias');
        const { rows } = await pool.query(`select * from transacoes where usuario_id = $1`, [id]);
        const transactions = rows.map((transacao) => {
            return {
                id: transacao.id,
                tipo: transacao.tipo,
                descricao: transacao.descricao,
                valor: transacao.valor,
                data: transacao.data,
                usuario_id: transacao.usuario_id,
                categoria_id: transacao.categoria_id,
                categoria_nome: categories.rows.filter((categoria) => {
                    if (categoria.id === transacao.categoria_id) {
                        return categoria.descricao
                    };
                })[0].descricao
            };
        })
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const updateTransaction = async (req, res) => {
    const idTransaction = Number(req.params.id);

    const idUser = req.usuario.id;

    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
    };

    try {
        const { rowCount } = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [idTransaction, idUser]
        );

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        };

        const idCategory = await pool.query('select descricao from categorias where id = $1', [categoria_id]);

        if (idCategory.rowCount < 1) {
            return res.status(400).json({ mensagem: 'O id da categoria informado não é válido' });
        };

        if (tipo !== 'entrada') {
            if (tipo !== 'saida') {
                return res.status(400).json({ mensagem: 'O tipo precisa ser igual a entrada ou saida' });
            }
        };

        const updatedTransaction = await pool.query(
            `update transacoes
            set 
            (descricao, valor, data, categoria_id, tipo) = ($1,$2,$3,$4,$5)
            where id = $6`,
            [descricao, valor, data, categoria_id, tipo, idTransacao]
        );

        return res.status(204).json({})
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const detailTransaction = async (req, res) => {
    const { idTransaction } = req.params;
    const { id } = req.usuario;

    try {
        const transaction = await pool.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [idTransaction, id]
        );

        return res.json(transaction.rows[0]);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const deleteTransaction = async (req, res) => {
    const idTransaction = req.params.id;
    const idUser = req.usuario.id;

    try {
        const { rowCount } = await pool.query(
            `select * from transacoes where id = $1 and usuario_id = $2`,
            [idTransaction, idUser]
        );

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        };

        const deletedTransaction = await pool.query(
            'delete from transacoes where id = $1',
            [idTransacao]
        );

        return res.status(204).json({});
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const getStatement = async (req, res) => {
    const { id } = req.usuario;

    try {
        const inflowList = await pool.query(`select valor from transacoes where usuario_id = $1 and tipo = 'entrada'`, [id]);
        const outflowList = await pool.query(`select valor from transacoes where usuario_id = $1 and tipo = 'saida'`, [id]);

        let entrada = inflowList.rows.reduce((acc, cur) => {
            return acc + cur.valor
        }, 0);

        if (inflowList.rowCount < 1) {
            entrada = 0
        }

        let saida = outflowList.rows.reduce((acc, cur) => {
            return acc + cur.valor
        }, 0);

        if (outflowList.rowCount < 1) {
            entrada = 0
        }

        return res.json({ entrada, saida })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = ({
    createTransaction,
    listTransactions,
    updateTransaction,
    detailTransaction,
    deleteTransaction,
    getStatement
});