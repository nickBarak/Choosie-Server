const express = require('express');
const router = express.Router();

router.post('/deleteBin.js', async (req, res) => {
    // console.log(req.body);
    res.json(await new Promise( (resolve, reject) => client.query(
        `UPDATE users SET "jsonb" = "jsonb" - '${req.body.bin}' || '{${req.body.restore}}'`)
            .then(res => resolve(res))
            .catch(err => reject(console.log(err)))))
})

module.exports = router;