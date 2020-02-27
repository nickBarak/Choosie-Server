const express = require('express');
const router = express.Router();

router.post('/updateBin.js', async (req, res) => {
    let query_res;
    if (req.body.action === 'add') {
        if (req.body.contents) {
            query_res = await new Promise( (resolve, reject) => client.query(`UPDATE users SET "jsonb" = JSONB_SET("jsonb", '{${req.body.bin}, ${req.body.movies}}', 'true') WHERE id = ${req.body.id}`)
                .then(res => resolve(res))
                .catch(err => reject(console.log(err))))
        } else {
            query_res = await new Promise( (resolve, reject) => client.query(`UPDATE users SET "jsonb" = JSONB_SET("jsonb", '{${req.body.bin}}', '{"${req.body.movies}": true}') WHERE id = ${req.body.id}`)
                .then(res => resolve(res))
                .catch(err => reject(console.log(err))))
        }
    } else {
        // query_res = await new Promise( (resolve, reject) => {
        //     for (let movie in req.body.movies) {
        //         client.query(`UPDATE users SET "jsonb" = "jsonb" #- '{$1, $2}`, [req.body.bin, movie])
        //             .then(res => resolve(res))
        //             .catch(err => reject(console.log(err))) } })
        query_res = await new Promise( (resolve, reject) => client.query(`UPDATE users SET "jsonb" = "jsonb" #- '{${req.body.bin}, ${req.body.movies}}' WHERE id = ${req.body.id}`)
                    .then(res => resolve(res))
                    .catch(err => reject(console.log(err))))
    }
    res.json(await query_res);       
});

module.exports = router;