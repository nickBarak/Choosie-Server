const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { queryDB } = require('../Functions');

router.get('/', async (req, res) =>
    queryDB(res,
        `SELECT
            *
        FROM
            popular_${req.query.column}
        OFFSET $1 ROWS
        FETCH NEXT 20 ROWS ONLY`, [Number(req.query.set) * 20 - 20])
)

module.exports = router