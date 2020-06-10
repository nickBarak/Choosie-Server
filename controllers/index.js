const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.sendFile('index');
    } catch (e) {
        console.log('error' + e);
    }
});

router.get('/search', async (req, res) => {
    const user = {name: 'Paul', age: 32};
    try {
        res.json(user);
    } catch (e) { console.log(e) }
});

module.exports = router;