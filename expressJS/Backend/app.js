const express = require('express');
const app = express();

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Hello Wolrd !');
});

app.listen(port, () => console.log(`Serveur lancé sur le port ${port}`));

app.get('/example/:id', (req, res) => {
    const id = req.params.id;
    const examples = data.example;

    const example = example.find(s => s.id === parseInt(id));
    res.send(example.name);
});