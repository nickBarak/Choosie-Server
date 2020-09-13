const express = require("express");
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const url = require('url');
require('dotenv').config();

const SESSION_TIMEOUT = 1000 * 60 * 30;
const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    REDIS_URL,
    SESSION_NAME,
    SESSION_SECRET
} = process.env;

const prod = NODE_ENV === 'production';

const redisURL = url.parse(REDIS_URL);
const redisClient = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true });
prod && redisClient.auth(process.env.REDIS_PASSWORD);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const whiteList = prod
    ? [ 
        undefined,
        'https://choosie.us',
    ]
    : [
        undefined,
        'https://choosie.us',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://127.0.0.1:8081',
        'http://127.0.0.1:8082'
    ];

app.use(cors({
    credentials: true,
    origin: (origin, callback) => whiteList.includes(origin)
    ? callback(null, true)
    : callback(new Error(origin + ' not allowed by CORS'))
}));
app.options('*', cors());

app.set('trust proxy', 1);
app.use(session({
    name: SESSION_NAME,
    cookie: {
        domain: prod ? '.choosie.us' : '127.0.0.1:8081',
        maxAge: 1000 * 60 * 30,
        sameSite: false,
        secure: prod,
        httpOnly: prod
    },
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    maxAge: SESSION_TIMEOUT,
    rolling: true,
    store: new redisStore({
        client: redisClient,
        ttl: 60 * 60
    })
}));

app.get('/destroy-session', (req, res) => {
    const { sessionID } = req;
    if (sessionID) {
        res.clearCookie(SESSION_NAME);
        res.json(true);
        req.session.destroy();
    } else {
        res.json(false);
    }
});

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
exports.pool = pool;

const index = require('./controllers/index'),
    users = require('./controllers/users'),
    search = require('./controllers/search'),
    movies = require('./controllers/movies'),
    start = require('./controllers/start'),
    myList = require('./controllers/myList'),
    popular = require('./controllers/popular');
    // custom = require('./controllers/custom');

app.use('/', index);
app.use('/users', users);
app.use('/search', search);
app.use('/movies', movies);
app.use('/start', start);
app.use('/my-list', myList);
app.use('/popular', popular);
// app.use('/custom', custom);

app.listen(PORT || 3000, console.log(`Listening on port ${PORT || 3000}`));
