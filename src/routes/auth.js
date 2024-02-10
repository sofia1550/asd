const express = require('express');
const User = require('../dao/models/User'); // Ajusta la ruta según tu estructura
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('../passportConfig'); // Asegúrate de que la ruta sea correcta

// Registro
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ first_name, last_name, email, age, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login con JWT
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Algo salió mal',
                user: user
            });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.json({ user, token });
        });
    })(req, res);
});

// Ruta /current para devolver el usuario basado en JWT
router.get('/api/sessions/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ user: req.user });
});

// Rutas para autenticación con GitHub
router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    // Aquí podrías generar un JWT también si fuera necesario
    res.redirect('/');
});

// Logout
router.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;
