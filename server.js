const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Client, Pool } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE });
client.connect()
    .then(_=> console.log('Connected to PostgreSQL'))
    .catch(e => console.log(e));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.use( (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://choosie.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const index = require('./controllers/index');
const start = require('./controllers/start/controller');
const myList = require('./controllers/myList/controller');
const popular = require('./controllers/popular/controller');

app.use('/', index);
app.use('/start', start);
app.use('/myList', myList);
app.use('/popular', popular);

app.listen(process.env.PORT, console.log(`Listening on port ${process.env.PORT}`));