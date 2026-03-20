const express = require('express');
const router = express.Router();
const { getProducts } = require('../controller/controller.js');

router.get('/products', getProducts);

module.exports = router;