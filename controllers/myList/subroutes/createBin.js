const express = require('express');
const router = express.Router();

router.post('/createBin.js', async (req, res) => res.json(await new Promise( (resolve, reject) => client.query(
    `UPDATE users SET "jsonb" = JSONB_SET("jsonb", '{${req.body.bin}}', 'null') WHERE id = ${req.body.id}`)
        .then(res => resolve(res))
        .catch(err => reject(console.log(err))))))

module.exports = router;