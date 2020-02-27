const express = require('express');
const router = express.Router();

router.post('/readBins.js', async (req, res) => {
    let movieData = []

    let getMovies = id => new Promise( (resolve, reject) => client.query('SELECT "jsonb", all_saved_movies FROM users WHERE id = $1', [id])
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(console.log(err))))

    let hydrateMovies = (...movies) => movies.map(movie => new Promise( (resolve, reject) => client.query('SELECT src_url, title, cover_file, description FROM sample_movie_data WHERE src_url = $1', [movie])
        .then(res => resolve(movieData.push(res.rows[0])))
        .catch(err => reject(console.log(err)))))

    await Promise.all(hydrateMovies
            .apply(null, (await getMovies(req.body.id)).all_saved_movies))
                .catch(e => console.log(e))
    res.json({ "bins": (await getMovies(req.body.id)).jsonb, "movieData": movieData })
})

module.exports = router;