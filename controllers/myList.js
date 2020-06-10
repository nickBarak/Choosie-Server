const express = require('express');
const router = express.Router();
const db = require('../Clean.js').pg();

router.post('/', async (req, res) => {
    let movieData = []

    let getMovies = id => new Promise( (resolve, reject) => db.query('SELECT "jsonb", all_saved_movies FROM users WHERE id = $1', [id])
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(console.log(err))))

    let hydrateMovies = (...movies) => movies.map(movie => new Promise( (resolve, reject) => db.query('SELECT src_url, title, cover_file, description FROM sample_movie_data WHERE src_url = $1', [movie])
        .then(res => resolve(movieData.push(res.rows[0])))
        .catch(err => reject(console.log(err)))))

    await Promise.all(hydrateMovies
            .apply(null, (await getMovies(req.body.id)).all_saved_movies))
                .catch(e => console.log(e))
    res.json({ "bins": (await getMovies(req.body.id)).jsonb, "movieData": movieData })
});

router.post('/createBin', async (req, res) => res.json(await new Promise( (resolve, reject) => db.query(
    `UPDATE users SET "jsonb" = JSONB_SET("jsonb", '{${req.body.bin}}', 'null') WHERE id = ${req.body.id}`)
        .then(res => resolve(res))
        .catch(err => reject(console.log(err))))));

router.post('/updateBin', async (req, res) => {
    let query_res;
    if (req.body.action === 'add') {
        if (req.body.contents) {
            query_res = await new Promise( (resolve, reject) => db.query(`UPDATE users SET "jsonb" = JSONB_SET("jsonb", '{${req.body.bin}, ${req.body.movies}}', 'true') WHERE id = ${req.body.id}`)
                .then(res => resolve(res))
                .catch(err => reject(console.log(err))))
        } else {
            query_res = await new Promise( (resolve, reject) => db.query(`UPDATE users SET "jsonb" = JSONB_SET("jsonb", '{${req.body.bin}}', '{"${req.body.movies}": true}') WHERE id = ${req.body.id}`)
                .then(res => resolve(res))
                .catch(err => reject(console.log(err))))
        }
    } else {
        // query_res = await new Promise( (resolve, reject) => {
        //     for (let movie in req.body.movies) {
        //         db.query(`UPDATE users SET "jsonb" = "jsonb" #- '{$1, $2}`, [req.body.bin, movie])
        //             .then(res => resolve(res))
        //             .catch(err => reject(console.log(err))) } })
        query_res = await new Promise( (resolve, reject) => db.query(`UPDATE users SET "jsonb" = "jsonb" #- '{${req.body.bin}, ${req.body.movies}}' WHERE id = ${req.body.id}`)
                    .then(res => resolve(res))
                    .catch(err => reject(console.log(err))))
    }
    res.json(await query_res);       
});

router.post('/deleteBin', async (req, res) => {
    // console.log(req.body);
    res.json(await new Promise( (resolve, reject) => db.query(
        `UPDATE users SET "jsonb" = "jsonb" - '${req.body.bin}' || '{${req.body.restore}}'`)
            .then(res => resolve(res))
            .catch(err => reject(console.log(err)))))
});

module.exports = router;