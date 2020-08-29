const express = require('express');
const router = express.Router();
const { pool } = require('../server');
const multer = require('multer');
const upload = multer();
const { queryDB } = require('../Functions');

// router.put('/:user/update', async (req, res) =>
//     queryDB(
//         `UPDATE users
//         SET
//             name = $1,
//             email = $2,
//             age = ,
//             sex = ,
//             bins = ,
//             languages = ,
//             avg_session_length_in_mins = ,
//             start_clicks

    
//         WHERE username = $1`, [req.params.user])
// )

// router.get('/:user')


router.get('/check', async (req, res) =>
    queryDB(res, 'SELECT username FROM users WHERE username = $1', [req.query.user])
);


router.post('/', async (req, res) => {
    const { name, email, username, password, age, sex, languages } = req.body;
    try {
        var client = await pool.connect();
        await client.query(
            `INSERT INTO users
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
            [name, email, username, password, age, sex, '{}', `{${languages ? languages.toString() : null}}`, 0, 0, 0, 0, 3, '{}', '{}', '{}', '{}', '{}', '{}', true, '{}']);
        const result = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);
        res.json(result.rows[0]);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

router.get('/:user', async (req, res) =>
    queryDB(res, `SELECT * FROM users WHERE LOWER(username) = LOWER($1)`, [req.params.user])
)

router.patch('/:user', async (req, res) => {
    const { name, sex, age, languages, email, show_save_history, show_description_on_hover, recent_save_history } = req.body;
    queryDB(res, `UPDATE users SET name = $1, sex = $2, age = $3, languages = $4, email = $5, show_save_history = $6, show_description_on_hover = $7, recent_save_history = $8 WHERE username = $9`, [name, sex, Number(age), languages, email, show_save_history, show_description_on_hover, recent_save_history, req.params.user]);
})

router.put('/:user', async (req, res) => {
    try {
        var client = await pool.connect();
        const response = await client.query(`SELECT password FROM users WHERE username = $1`, [req.params.user]);
        if (response.rows[0].password !== req.body.currentPassword) throw new Error('Invalid password');
        const { rows } = client.query(`UPDATE users SET password = $1 WHERE username = $2`, [req.body.newPassword, req.params.user]);
        res.json(rows);
    } catch (e) { console.log(e) }
    finally { client.release() }
})

// Bin Management

router.post('/:user/bins', upload.none(), async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins || $1 WHERE username = $2`, [req.body.bin, req.params.user])
)

router.put('/:user/bins', upload.none(), async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins || $1 WHERE username = $2`, [req.body.bin, req.params.user]))

router.delete('/:user/bins', upload.none(), async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins - $1 WHERE username = $2`, [req.body.bin, req.params.user])
)

router.patch('/:user/bins', async (req, res) =>
    queryDB(res, `UPDATE users SET bins = bins || $1 WHERE username = $2`, [req.body.bin, req.params.user])
)

module.exports = router