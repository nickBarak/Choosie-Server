const express = require("express");
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv/config');

app.options('*', cors());
app.use(cors({ origin: 'https://www.choosie.us' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const pool = new Pool({
    connectionString: process.env.DATABASE,
    idleTimeoutMillis: 0
});
exports.pool = pool;
pool
    ? console.log('Connected to PostgreSQL')
    : console.log('Failed to connect to database');


const index = require('./controllers/index'),
    users = require('./controllers/users'),
    search = require('./controllers/search'),
    movies = require('./controllers/movies'),
    start = require('./controllers/start'),
    myList = require('./controllers/myList'),
    popular = require('./controllers/popular');


app.use('/', index);
app.use('/users', users);
app.use('/search', search);
app.use('/movies', movies);
app.use('/start', start);
app.use('/my-list', myList);
app.use('/popular', popular);


app.listen(process.env.PORT || 3000, console.log(`Listening on port ${process.env.PORT || 3000}`));

