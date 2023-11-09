const express = require('express');

const {
    listCategories
} = require('./controllers/categories');

const {
    createTransaction,
    listTransactions,
    updateTransaction,
    detailTransaction,
    deleteTransaction,
    getStatement
} = require('./controllers/transactions');

const {
    signup,
    login,
    detailUser,
    updateUser
} = require('./controllers/users');

const authenticateUser = require('./midways/authentication');

const routes = express();

routes.post('/usuario', signup);
routes.post('/login', login);

routes.use(authenticateUser);

routes.get('/usuario', detailUser);
routes.put('/usuario', updateUser);

routes.get('/categoria', listCategories);

routes.get('/transacao/extrato', getStatement);
routes.post('/transacao/', createTransaction);
routes.get('/transacao', listTransactions);
routes.get('/transacao/:idTransacao', detailTransaction);
routes.put('/transacao/:id', updateTransaction);
routes.delete('/transacao/:id', deleteTransaction);

module.exports = routes;