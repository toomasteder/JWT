const express = require('express');

const bcryptjs = require('bcryptjs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const verifyTokenAndUser = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    const { username, message } = req.query;
    res.render('login', { username, message });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const filePath = 'users.json';

    if (fs.existsSync(filePath)) {
        const existingUsers = JSON.parse(fs.readFileSync(filePath));
        const user = existingUsers.find((user) => user.username === username);

        if (!user) {
            res.redirect(
                `/login?message=${encodeURIComponent('Wrong username!')}&username=${encodeURIComponent(username)}`,
            );
        }

        if (bcryptjs.compareSync(password, user.passwordHash)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.cookie('jwt_token', token, { maxAge: 60 * 60 * 100, httpOnly: true });

            res.redirect('/dashboard');
        }
    }
    res.redirect(
        `/login?message=${encodeURIComponent('Oops! Something went wrong!')}&username=${encodeURIComponent(username)}`,
    );
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { firstname, lastname, email, username, password } = req.body;

    const filePath = 'users.json';
    let existingUsers = null;

    if (fs.existsSync(filePath)) {
        existingUsers = JSON.parse(fs.readFileSync(filePath));
    } else {
        existingUsers = [];
    }

    const passwordHash = bcryptjs.hashSync(password);
    const user = { firstname, lastname, email, username, passwordHash }
    existingUsers.push(user);
    fs.writeFileSync(filePath, JSON.stringify(existingUsers));

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.cookie('jwt_token', token, { maxAge: 60 * 60 * 100, httpOnly: true });

    res.end('REGISTERED');
});

router.get('/dashboard', verifyTokenAndUser, (req, res) => {
    const { user } = req;
    res.render('dashboard', { user });
});

router.get('/logout', (req, res) => {
    res.clearCookie('jwt_token');
    res.redirect(`/login?message=${encodeURIComponent("You've been logged out!")}`);
});

module.exports = router;