const express = require("express");
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: (origin, callback) => [
    'https://choosie.us',
    'http://localhost:8081'
 ].includes(origin)
    ? callback(null, true)
    : callback(new Error('Not allowed by CORS'))
}));
app.options('*', cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 0
});
exports.pool = pool;
/* Reports DB connection status */
(async _=>{
    try {
        var client = await pool.connect();
        client
            ? console.log('Connected to PostgreSQL')
            : console.log('Failed to connect to database');
    } catch (e) { console.log(e) }
    finally { client && client.release() }
})();

const index = require('./controllers/index'),
    users = require('./controllers/users'),
    search = require('./controllers/search'),
    movies = require('./controllers/movies'),
    start = require('./controllers/start'),
    myList = require('./controllers/myList'),
    popular = require('./controllers/popular'),
    custom = require('./controllers/custom');


app.use('/', index);
app.use('/users', users);
app.use('/search', search);
app.use('/movies', movies);
app.use('/start', start);
app.use('/my-list', myList);
app.use('/popular', popular);
app.use('/custom', custom);


app.listen(process.env.PORT || 3000, console.log(`Listening on port ${process.env.PORT || 3000}`));

