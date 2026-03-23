const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, getCategoriesById } = require('../controller/controller.js');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);

module.exports = router;