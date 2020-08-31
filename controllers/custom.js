const express = require('express');
const router = express.Router();
const { queryDB } = require('../Functions');

router.get('/', async (req, res) => {
    for (let i = 1; i < 84894; i += 4) {
        await queryDB(res, `DELETE FROM popular_trending WHERE id = ANY('{${i, i+1, i+2}}')`);
        await queryDB(res, `DELETE FROM popular_recent_releases WHERE id = ANY('{${i+2, i+3, i+4}}')`);
        await queryDB(res, `DELETE FROM popular_most_saved_this_month WHERE id = ANY('{${i+3, i+4, i+5}}')`);
        await queryDB(res, `DELETE FROM popular_most_saved WHERE id = ANY('{${i+4,i+5,i+6}}')`);
    }
    res.send('Items deleted');
})

module.exports = router