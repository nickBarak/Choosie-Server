const express = require('express');
const router = express.Router();
const { queryDB } = require('../Functions');

router.get('/', (req, res) => res.send('Welcome to the Choosie server'));

router.post('/home/:user', async (req, res) =>
    queryDB(res, `UPDATE users SET ${req.body.button}_clicks = (${req.body.button}_clicks + 1) WHERE username = $1`, [req.params.user])
);

module.exports = router;