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
                SELECT
                    id,
                    json_build_object('id', id, 'title', title, 'mpaa_rating', mpaa_rating, 'duration_in_mins', duration_in_mins, 'cover_file', cover_file, 'release_date', release_date, 'genres', genres),
                    unnest(actors) actor,
                    unnest(writers) writer,
                    unnest(directors) director,
                    unnest(genres) genre,
                    title,
                    description
                FROM movie_data) x
            WHERE
                LOWER(title) LIKE LOWER('%${req.query.search}%')
                OR LOWER(actor) LIKE LOWER('%${req.query.search}%')
                OR LOWER(writer) LIKE LOWER('%${req.query.search}%')
                OR LOWER(director) LIKE LOWER('%${req.query.search}%')
                OR LOWER(genre) LIKE LOWER('%${req.query.search}%')
                OR LOWER(description) LIKE LOWER('%${req.query.search}%')`);


            // `SELECT
            //     json_build_object('id', id, 'title', title, 'mpaa_rating', mpaa_rating, 'duration_in_mins', duration_in_mins, 'cover_file', cover_file, 'release_date', release_date, 'genres', genres)
            // FROM
            //     movie_data
            // WHERE
            //     LOWER(title) LIKE LOWER('%${req.query.search}%')
            //     OR '${req.query.search.split(' ').map(part => part[0].toUpperCase() + part.slice(1).split('').map(c => c.toLowerCase() ).join('')).join(' ')}' = ANY(actors)
            //     OR '${req.query.search.split(' ').map(part => part[0].toUpperCase() + part.slice(1).split('').map(c => c.toLowerCase() ).join('')).join(' ')}' = ANY(writers)
            //     OR '${req.query.search.split(' ').map(part => part[0].toUpperCase() + part.slice(1).split('').map(c => c.toLowerCase() ).join('')).join(' ')}' = ANY(directors)
            //     OR '${req.query.search[0].toUpperCase() + req.query.search.slice(1).split('').map(c => c.toLowerCase()).join('')}' = ANY(genres)
            //     OR LOWER(description) LIKE LOWER('%${req.query.search}%')
            // OFFSET $1 ROWS
            // FETCH NEXT 11 ROWS ONLY`, [Number(req.query.page) * 10 - 10 || '0']);


        await client.query(`UPDATE users SET search_history = array_append(search_history, $1) WHERE username = $2`, [req.query.search, req.query.user ? req.query.user : 'anonymous']);
        rows = rows.reduce((acc, cur) => acc.find(movie => movie.id === cur.id) ? acc : [ ...acc, cur.json_build_object ], []).slice(Number(req.query.page) * 10 - 10, Number(req.query.page) * 10 + 1)
        res.json(rows.length ? rows : null);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

router.post('/', async (req, res) =>
    queryDB(res,
        `UPDATE
            users
        SET
            search_ratings = array_append(search_ratings, $1),
            avg_search_rating = array_sum(search_ratings) / cardinality(search_ratings)
        WHERE
            username = $2`, [req.body.rating, req.body.username || 'anonymous'])
)

module.exports = router