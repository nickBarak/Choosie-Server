const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const { queryDB } = require('../Functions');

// router.get('/', async (req, res) => {
//     try {
//         var client = await pool.connect();
//         const { rows } = await client.query('SELECT username FROM users', []);
//         res.json(rows);
//     } catch (e) { console.log(e) }
//     finally { client.release() }
// })

// router.get('/', async (req, res) => {
//     const { search } = req.query;
//     try {
//         var client = await pool.connect(),
//             { rows } = await client.query(`SELECT json_build_object('title', title, 'rating', mpaa_rating) FROM sample_movie_data WHERE title LIKE $1`, [search]);
//         rows = rows.map(row => row.json_build_object);
//         console.log(rows)
//         res.json(rows.length ? rows : 'No results found');
//     } catch (e) { console.log(e) }
//     finally { client.release() }
// });

router.post('/home/:user', async (req, res) =>
    queryDB(res, `UPDATE users SET ${req.body.button}_clicks = (${req.body.button}_clicks + 1) WHERE username = $1`, [req.params.user])
)

module.exports = router;