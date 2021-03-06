const { pool } = require('./server');
require('dotenv').config();

async function queryDB(response, query, queryparams) {
    try {
        var client = await pool.connect();
        const { rows } = await client.query(query, queryparams);
        response.json(rows);
    } catch (e) { console.log(e) }
    finally { client && client.release() }
}

const checkAuthentication = (req, res, next, shouldHave=true) =>
    req.session.username
        ? shouldHave
            ? next()
            : res.redirect(process.env.NODE_ENV === 'production' ? 'https://api.choosie.us/destroy-session' : `http://localhost:${process.env.PORT}/destroy-session`)
        : shouldHave
            ? res.end('Not logged in')
            : next()

module.exports = { queryDB, checkAuthentication }