const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { queryDB } = require('../Functions');

router.get('/', async (req, res) => {
    try {
        var client = await pool.connect();
        const { rows } = await client.query(
            `SELECT
                json_build_object('id', id, 'title', title, 'mpaa_rating', mpaa_rating, 'duration_in_mins', duration_in_mins, 'cover_file', cover_file, 'release_date', release_date, 'genres', genres)
            FROM
                sample_movie_data
            WHERE
                LOWER(title) LIKE LOWER('%${req.query.search}%')
            ORDER BY
                title
            OFFSET $1 ROWS
            FETCH NEXT 11 ROWS ONLY`, [Number(req.query.page) * 10 - 10 || '0']);
        if (req.query.user != 'null')
            await client.query(`UPDATE users SET search_history = array_append(search_history, $1) WHERE username = $2`, [req.query.search, req.query.user]);
        res.json(rows.length ? rows.map(row => row.json_build_object) : null);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

router.post('/', async (req, res) =>
    queryDB(res, pool,
        `UPDATE
            users
        SET
            search_ratings = array_append(search_ratings, $1),
            avg_search_rating = array_sum(search_ratings) / cardinality(search_ratings)
        WHERE
            username = $2`, [req.body.rating, req.body.username || 'anonymous'])
)

module.exports = router