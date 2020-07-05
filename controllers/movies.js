const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { queryDB } = require('../Functions');

router.get('/', async (req, res) =>
    queryDB(res, `SELECT * FROM sample_movie_data WHERE id = $1`, [req.query.id])
)


router.get('/list', async (req, res) => {
    console.log(req.query);
    queryDB(res, `SELECT * FROM sample_movie_data WHERE id = ANY('{${req.query.movies ? req.query.movies : ''}}')`)}
)


router.post('/', async (req, res) => {
    try {
        var client = await pool.connect();
        await client.query(
            `UPDATE sample_movie_data
            SET times_saved = times_saved + 1,
                times_saved_this_month = times_saved_this_month + 1
            WHERE id = $1`, [req.body.movieID]);
        await client.query(
            `UPDATE users
            SET
                save_history = array_append(save_history, $1),
                recent_save_history = array_append(recent_save_history, $1),
                currently_saved = array_append(currently_saved, $1)
            WHERE username = $2`, [req.body.movieID, req.query.user]);
        res.json(true);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

router.put('/', async (req, res) => {
    try {
        var client = await pool.connect();
        await client.query(
            `UPDATE sample_movie_data
            SET times_saved_this_month = times_saved_this_month + 1
            WHERE id = $1`, [req.body.movieID]);
        await req.body.inRecent
            ? client.query(
                `UPDATE users
                SET currently_saved = array_append(currently_saved, $1)
                WHERE username = $2`, [req.body.movieID, req.query.user])
            : client.query(
                `UPDATE users
                SET currently_saved = array_append(currently_saved, $1),
                    recent_save_history = array_append(recent_save_history, $1)
                WHERE username = $2`, [req.body.movieID, req.query.user]);
        res.json(true);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

router.delete('/', async (req, res) =>
    queryDB(res,
        `UPDATE users
        SET
            currently_saved = array_remove(currently_saved, $1)
        WHERE
            username = $2`, [req.body.movieID, req.query.user])
)

module.exports = router