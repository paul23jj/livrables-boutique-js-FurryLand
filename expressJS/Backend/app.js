const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

const cors = require('cors');

const data = require('./data.json')

app.use(cors({
    origin: '*'
}))

//tout à la fin
app.listen(port, () => console.log(`Serveur lancé sur le port ${port}`));