const express = require('express');
const { createTransaction, getMyTransactions } = require('../controllers/transactionController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/transactions', auth, createTransaction);
router.get('/transactions/me', auth, getMyTransactions);

module.exports = router;
