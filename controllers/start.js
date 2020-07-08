const express = require('express');
const router = express.Router();
const { queryDB } = require('../Functions');
const { pool } = require('../server');

router.get('/', async (req, res) =>{
    console.log(req.query);

    queryDB(res,
        `SELECT *
        FROM movie_data
        WHERE
            ${req.query.genres && '(' + req.query.genres.split(',').map((genre, i) => `${i === 0 ? '' : ' OR '}'${genre}' = ANY(genres)`).join('') + ')'}
            ${req.query.timeConstraint ? `${req.query.genres ? 'AND ' : ''}duration_in_mins <= ${req.query.timeConstraint}` : ''}
            ${req.query.timePeriods
                ? `${req.query.genres || req.query.timeConstraint ? 'AND ' : ''}(${req.query.timePeriods.split(',').map((period, i) => `${i === 0 ? '' : ' OR '}${(_=> {
                    switch (period) {
                        default: return '';
                        case 'Earlier':
                            return `release_date < '1970-01-01'::date`;
                        case 'Later':
                            return `release_date > '2010-01-01'::date`;
                        case '1970s':
                            return `(release_date between '1970-01-01'::date AND '1980-01-1'::date)`;
                        case '1980s':
                            return `(release_date between '1980-01-01'::date AND '1990-01-01'::date)`;
                        case '1990s':
                            return `(release_date between '1990-01-01'::date AND '2000-01-01'::date)`;
                        case '2000s':
                            return `(release_date between '2000-01-01'::date AND '2010-01-01'::date)`;
                    }
                })()}`).join('')})`
                : ''}
            ORDER BY
                cover_file = 'Not available'
            OFFSET ${Number(req.query.set) * 20 - 20} ROWS
            FETCH NEXT 20 ROWS ONLY`)
            
});

router.post('/', async (req, res) => {
    try {
        var client = await pool.connect();
        for (let selection of req.body.genres)
            await client.query(`UPDATE users SET genre_selection = genre_selection || '{"${Object.keys(selection)[0]}": ${Object.values(selection)[0]}}' WHERE username = $1`, [req.query.user]);
        res.send(true);
    } catch (e) { console.log(e) }
    finally { client.release() }
});

module.exports = router