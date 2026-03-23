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

module.exports = { getProducts, getProductById, getCategories, getCategoriesById };