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

routes.post('/user', signup);
routes.post('/login', login);

routes.use(authenticateUser);

routes.get('/user', detailUser);
routes.put('/user', updateUser);

routes.get('/category', listCategories);

routes.get('/transaction', listTransactions);
routes.get('/transaction/statement', getStatement);
routes.post('/transaction/', createTransaction);
routes.get('/transaction/:transactionId', detailTransaction);
routes.put('/transaction/:id', updateTransaction);
routes.delete('/transaction/:id', deleteTransaction);

module.exports = routes;