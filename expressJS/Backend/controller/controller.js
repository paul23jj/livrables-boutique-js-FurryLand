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

module.exports = { getProducts };