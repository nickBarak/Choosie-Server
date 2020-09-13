const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const bcrypt = require('bcryptjs');
const { queryDB, checkAuthentication } = require('../Functions');

router.post('/validate', (req, res, next) => checkAuthentication(req, res, next, false), async (req, res) => {
    try {
        var client = await pool.connect();
        const response = await client.query(`SELECT username, password FROM users WHERE username = $1`, [req.body.username]);
        const user = response.rows[0];
        if (!user) return res.json(false);

        let validLogin = await bcrypt.compare(req.body.password, user.password);

        if (!validLogin) return res.json(false);
        /* Cache user credentials */
        req.session.username = user.username;
        res.session.save();
        
        res.json(true);
    } catch (e) { console.log(e) }
    finally { client && client.release() }
})

router.get('/check', async (req, res) =>
    queryDB(res, 'SELECT username FROM users WHERE username = $1', [req.query.user])
)


router.post('/', async (req, res) => {
    const { name, email, username, password, age, sex, languages } = req.body;
    try {
        var client = await pool.connect();
        await client.query(
            `INSERT INTO users
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
            [name, email, username, await bcrypt.hash(password, 10), age, sex, '{}', `{${languages ? languages.toString() : null}}`, 0, 0, 0, 0, 3, '{}', '{}', '{}', '{}', '{}', '{}', true, '{}', true, '{}']);
        const result = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);
        res.json(result.rows[0]);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

router.get('/:user', checkAuthentication, async (req, res) => {
    try {
        var client = await pool.connect();
        const user = await client.query(`SELECT * FROM users WHERE LOWER(username) = LOWER($1)`, [req.session.username]);
        delete user.password
        res.json({ ...user.rows[0] });
    } catch (e) { console.log(e) }
    finally { client && client.release() }
})

router.patch('/:user', checkAuthentication, async (req, res) => {
    const { name, sex, age, languages, email, show_save_history, show_description_on_hover, recent_save_history } = req.body;
    queryDB(res, `UPDATE users SET name = $1, sex = $2, age = $3, languages = $4, email = $5, show_save_history = $6, show_description_on_hover = $7, recent_save_history = $8 WHERE username = $9`, [name, sex, Number(age), languages, email, show_save_history, show_description_on_hover, recent_save_history, req.session.username]);
})

router.put('/:user', checkAuthentication, async (req, res) => {
    try {
        var client = await pool.connect();
        const response = await client.query(`SELECT password FROM users WHERE username = $1`, [req.session.username]);
        if (!bcrypt.compare(response.rows[0].password, req.body.currentPassword) ) throw new Error('Invalid password');
        await client.query(`UPDATE users SET password = $1 WHERE username = $2`, [await bcrypt.hash(req.body.newPassword, 10), req.session.username]);
        res.json(true);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

// Bin Management

router.post('/:user/bins', async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins || $1 WHERE username = $2`, [req.body.bin, req.session.username])
)

router.put('/:user/bins', async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins || $1 WHERE username = $2`, [req.body.bin, req.session.username]))

router.delete('/:user/bins', async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins - $1 WHERE username = $2`, [req.body.bin, req.session.username])
)

router.patch('/:user/bins', async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins || $1 WHERE username = $2`, [req.body.bin, req.session.username])
)

module.exports = router