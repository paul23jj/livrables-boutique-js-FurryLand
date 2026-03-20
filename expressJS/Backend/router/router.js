const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controller/controller.js');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);

module.exports = router;