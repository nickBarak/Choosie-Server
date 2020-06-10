const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv/config');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.use( (req, res, next) => { C.allow(res, 'http://127.0.0.1:3000'); next() });

const index = require('./controllers/index');
const start = require('./controllers/start');
const myList = require('./controllers/myList');
const popular = require('./controllers/popular');

app.use('/', index);
app.use('/start', start);
app.use('/myList', myList);
app.use('/popular', popular);

app.listen(process.env.PORT || 3000, console.log(`Listening on port ${process.env.PORT || 3000}`));