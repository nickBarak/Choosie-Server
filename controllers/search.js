const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { queryDB } = require('../Functions');

router.get('/', async (req, res) => {
    try {
        var client = await pool.connect();
        let { rows } = await client.query(
            `SELECT *
            FROM (
                SELECT DISTINCT ON
                    (id) id,
                    json_build_object('id', id, 'title', title, 'mpaa_rating', mpaa_rating, 'duration_in_mins', duration_in_mins, 'cover_file', cover_file, 'release_date', release_date, 'genres', genres),
                    unnest(actors) actor,
                    unnest(writers) writer,
                    unnest(directors) director,
                    unnest(genres) genre,
                    title,
                    description,
                    cover_file,
                    mpaa_rating,
                    duration_in_mins,
                    release_date,
                    genres
                FROM movie_data) x
            WHERE
                LOWER(title) LIKE LOWER('%${req.query.search.replace(/'/g, "''")}%')
                OR LOWER(actor) LIKE LOWER('%${req.query.search.replace(/'/g, "''")}%')
                OR LOWER(writer) LIKE LOWER('%${req.query.search.replace(/'/g, "''")}%')
                OR LOWER(director) LIKE LOWER('%${req.query.search.replace(/'/g, "''")}%')
                OR LOWER(genre) LIKE LOWER('%${req.query.search.replace(/'/g, "''")}%')
                OR LOWER(description) LIKE LOWER('%${req.query.search.replace(/'/g, "''")}%')
            OFFSET $1 ROWS
            FETCH NEXT 11 ROWS ONLY`, [Number(req.query.page) * 10 - 10 || '0']);

        await client.query(`UPDATE users SET search_history = array_append(search_history, $1) WHERE username = $2`, [req.query.search, req.query.user ? req.query.user : 'anonymous']);
        res.json(rows.length ? rows.map(row => row.json_build_object) : []);
    } catch (e) { console.log(e) }
    finally { client && client.release() }
});

router.post('/', async (req, res) =>
    queryDB(res,
        `UPDATE
            users
        SET
            search_ratings = array_append(search_ratings, $1),
            avg_search_rating = array_sum(search_ratings) / cardinality(search_ratings)
        WHERE
            username = $2`, [req.body.rating, req.body.username || 'anonymous'])
);

router.get('/cache', async (req, res) => {
    try {
        var client = await pool.connect();
        const { rows } = await client.query(`SELECT * FROM movie_data WHERE id = ANY('{${req.query.movies ? req.query.movies.split(',').map(movieID => Number(movieID)) : ''}}')`);

        await client.query(`UPDATE users SET search_history = array_append(search_history, $1) WHERE username = $2`, [req.query.search, req.query.user ? req.query.user : 'anonymous']);

        res.json(rows.length ? rows.map(row => row.json_build_object) : []);
    } catch (e) { console.log(e) }
    finally { client && client.release() }
});

module.exports = router