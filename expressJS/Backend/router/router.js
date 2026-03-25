const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, getCategoriesById, register, login, getCart  } = require('../controller/controller.js');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);

router.post('/register', register);
router.post('/login', login);

router.get('/cart/:user_id', getCart);

module.exports = router;