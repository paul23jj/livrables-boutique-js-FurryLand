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
    connexion.query('INSERT INTO ')
}

module.exports = { getProducts, getProductById, getCategories, getCategoriesById, register };