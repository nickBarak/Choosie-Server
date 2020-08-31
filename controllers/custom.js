const express = require('express');
const router = express.Router();
const { pool } = require('../server');

router.get('/', async (req, res) => {
    try {
        var client = await pool.connect();
        for (let i = 1; i < 10000/*84888*/; i += 4) {
            await client.query(`DELETE FROM popular_trending WHERE id = ANY('{${i, i+1, i+2}}')`);
            await client.query(`DELETE FROM popular_recent_releases WHERE id = ANY('{${i+2, i+3, i+4}}')`);
            await client.query(`DELETE FROM popular_most_saved_this_month WHERE id = ANY('{${i+3, i+4, i+5}}')`);
            await client.query(`DELETE FROM popular_most_saved WHERE id = ANY('{${i+4,i+5,i+6}}')`);
        }
        res.send('Items deleted');
    } catch (e) { console.log(e) }
    finally { client && client.release() }
});

module.exports = router