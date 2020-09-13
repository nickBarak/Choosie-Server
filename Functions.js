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

const checkAuthentication = (req, res, next, shouldHave=true) => console.log(req.sessionID, req.session.username) ||
    req.session.username
        ? shouldHave
            ? next()
            : req.session.destroy() && res.clearCookie(process.env.SESSION_NAME)
        : shouldHave
            ? res.end('Not logged in')
            : next()

module.exports = { queryDB, checkAuthentication }