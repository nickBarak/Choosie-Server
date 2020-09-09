const express = require("express");
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
// const session = require('express-session');
// const redisClient = require('redis').createClient();
// const redisStore = require('connect-redis')(session);
// const cookieParser = require('cookie-parser');
require('dotenv').config();

const SESSION_TIMEOUT = 1000 * 60 * 30;
const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    REDIS_PORT,
    REDIS_HOST,
    SESSION_NAME,
    SESSION_SECRET
} = process.env;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/* Redis Session/Cookie Authentication disabled due to differing domain in client */

// app.use(cookieParser());
// app.use(session({
//     name: SESSION_NAME,
//     cookie: {
//         domain: 'http://localhost:8081',
//         maxAge: 1000 * 60 * 30,
//         sameSite: false,
//         secure: NODE_ENV === 'production',
//         httpOnly: false
//     },
//     resave: false,
//     saveUninitialized: false,
//     secret: SESSION_SECRET,
//     maxAge: SESSION_TIMEOUT,
//     rolling: true,
//     store: new redisStore({
//         host: REDIS_HOST,
//         port: REDIS_PORT || 6379,
//         client: redisClient,
//         ttl: 1000 * 60 * 60
//     })
// }));
app.use(cors({
    // credentials: true,
    origin: (origin, callback) => [
    'https://choosie.us',
    'http://localhost:8081',
    'http://localhost:8082'
 ].includes(origin)
    ? callback(null, true)
    : callback(new Error('Not allowed by CORS'))
}));
app.options('*', cors());

const pool = new Pool({
    connectionString: DATABASE_URL,
    idleTimeoutMillis: 0
});

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

app.listen(PORT || 3000, console.log(`Listening on port ${PORT || 3000}`));

module.exports = { pool, /* redisClient */ }
