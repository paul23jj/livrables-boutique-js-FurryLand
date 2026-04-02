const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, getCategoriesById, register, login, getCart, addToCart, deleteFromCart, getOrders, createOrder  } = require('../controller/controller.js');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);

router.post('/register', register);
router.post('/login', login);

router.get('/cart/:user_id', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:id', deleteFromCart);

router.post('/api/orders/:user_id', getOrders);
router.post('/orders', createOrder);

module.exports = router;