const bcrypt = require('bcrypt');
const connexion = require('../DB/db.js');

const getProducts = (req, res) => {
    connexion.query('SELECT * FROM products', (err, results) => {
        if(err) {
            res.status(500).json({ error: err });
        }else {
            res.status(200).json(results);
        }
    });
}

const getProductById = (req, res) => {
    connexion.query('SELECT * FROM products WHERE ID = ?', [req.params.id], (err, results) => {
        if(err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const getCategories = (req, res) => {
    connexion.query('SELECT * FROM categories', (err, results) => {
        if(err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const getCategoriesById = (req, res) => {
    connexion.query('SELECT * FROM categories WHERE ID = ?', [req.params.id], (err, results) => {
        if(err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const register = (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 10, (err, hash) => {
        if(err) {
            res.status(500).json({ error: err });
            return;
        }
        connexion.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hash], (err, results) => {
            if(err) {
                res.status(500).json({ error: err});
            } else {
                res.status(200).json(results);
            }
        });
    });
}

const login = (req, res) => {
    connexion.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, results) => {
        if(err){
            res.status(500).json({ error: err});
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Utilisateur introuvable'});
        } else {
            bcrypt.compare(req.body.password, results[0].password_hash, (err, match) => {
                if (match === true) {
                    res.status(200).json({
                        id: results[0].id,
                        username: results[0].username,
                        email: results[0].email
                    });
                } else {
                    res.status(401).json({ message: 'Non autorisé'});
                }
            })
        }
    });
}

const getCart = (req, res) => {
    connexion.query('SELECT * FROM cart_items WHERE user_id = ?', [req.params.user_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const addToCart = (req, res) => {
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;
    const quantity = req.body.quantity;
    connexion.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES(?, ?, ?)', [user_id, product_id, quantity], (err, results) => {
        if(err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const deleteFromCart = (req, res) => {
    connexion.query('DELETE FROM cart_items WHERE id = ?', [req.params.id], (err, results) => {
        if(err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const getOrders = (req, res) => {
    connexion.query('SELECT * FROM orders WHERE user_id = ?', [req.params.user_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

const createOrder = (req, res) => {
    const user_id = req.body.user_id;
    const total_price = req.body.total_price;
    connexion.query('INSERT INTO orders (user_id, total_price) VALUES (?, ?)', [user_id, total_price], (err, results) => {
        if(err) {
            res.status(500).json({ error: err});
        } else {
            res.status(200).json(results);
        }
    });
}

module.exports = { getProducts, getProductById, getCategories, getCategoriesById, register, login, getCart, addToCart, deleteFromCart, getOrders, createOrder };