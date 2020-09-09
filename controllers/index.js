const express = require('express');
const router = express.Router();
// const { redisClient } = require('../server');
const { queryDB } = require('../Functions');

router.get('/', (req, res) => res.send('Welcome to the Choosie server'));

// router.get('/cached-user', (req, res) => {
    // if (!req.sessionID) return res.json(null);
    // redisClient.get(req.sessionID, (err, reply) => {
    //     if (err) throw err;
    //     res.json(reply);
    // });
// });

router.post('/home/:user', async (req, res) =>
    queryDB(res, `UPDATE users SET ${req.body.button}_clicks = (${req.body.button}_clicks + 1) WHERE username = $1`, [req.params.user])
);

module.exports = router;