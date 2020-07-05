const { pool } = require('../server');

async function queryDB(response, query, queryparams) {
    console.log({query, queryparams})
    try {
        var client = await pool.connect();
        const { rows } = await client.query(query, queryparams);
        response.json(rows);
    } catch (e) { console.log(e) }
    finally { client.release() }
}

exports.queryDB = queryDB