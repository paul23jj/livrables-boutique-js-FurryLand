const express = require('express');
const connexion = require('./DB/db.js');
const router = require('./router/router.js');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use('/api', router);

connexion.connect((err) => {
    if(err) {
        console.log('Erreur de connexion : '+ err);
    } else {
        console.log('Connexion à la BDD réussie');
    }
})

//a la fin
app.listen(port, () => console.log(`Serveur lancé sur le port ${port}`));
