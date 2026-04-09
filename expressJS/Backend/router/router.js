const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, getCategoriesById, register, login, getCart, addToCart, deleteFromCart, getOrders, createOrder, updateStock, getProductAttributes, getFavorites, addFavorites, deleteFavorite, getAddresses, addAddresses  } = require('../controller/controller.js');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);

router.post('/register', register);
router.post('/login', login);

router.get('/cart/:user_id', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:id', deleteFromCart);

router.post('/orders/:user_id', getOrders);
router.post('/orders', createOrder);

router.put('/products/:id/stock', updateStock);

router.get('/products/:id/attributes', getProductAttributes);

router.get('/favorites/:user_id', getFavorites);
router.post('/favorites', addFavorites);
router.delete('/favorites/:id', deleteFavorite);

router.get('/addresses/:user_id', getAddresses);
router.post('/addresses', addAddresses);


module.exports = router;