const express = require('express');
const router = express.Router();
const { getBalance } = require('../controllers/walletController');

router.get('/:username', getBalance);

module.exports = router;
