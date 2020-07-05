const express = require('express');
const router = express.Router();
const { queryDB } = require('../Functions');

router.get('/', async (req, res) =>{
    console.log(req.query);

    queryDB(res,
        `SELECT *
        FROM sample_movie_data
        WHERE
            ${req.query.genres && '(' + req.query.genres.split(',').map((genre, i) => `${i === 0 ? '' : ' OR '}'${genre}' = ANY(genres)`).join('') + ')'}
            ${req.query.timeConstraint ? `${req.query.genres ? 'AND ' : ''}duration_in_mins <= ${req.query.timeConstraint}` : ''}
            ${req.query.timePeriods
                ? `${req.query.genres || req.query.timeConstraint ? 'AND ' : ''}(${req.query.timePeriods.split(',').map((period, i) => `${i === 0 ? '' : ' OR '}${(_=> {
                    switch (period) {
                        default: return '';
                        case 'Earlier':
                            return 'release_date < 1970';
                        case 'Later':
                            return 'release_date > 2000';
                        case '1970s':
                            return '(release_date < 1980 AND release_date >= 1970)';
                        case '1980s':
                            return '(release_date < 1990 AND release_date >= 1980)';
                        case '1990s':
                            return '(release_date < 2000 AND release_date >= 1990)';
                        case '2000s':
                            return '(release_date < 2010 AND release_date >= 2000)';
                    }
                })()}`).join('')})`
                : ''}
            OFFSET ${Number(req.query.set) * 20 - 20} ROWS
            FETCH NEXT 20 ROWS ONLY`)
            
});

module.exports = router