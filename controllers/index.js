const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.sendFile('index');
    } catch (e) {
        console.log('error' + e);
    }
})

module.exports = router;