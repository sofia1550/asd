const express = require('express');
const User = require('../dao/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('../passportConfig'); 

// Registro
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login con Passport
router.post('/login', passport.authenticate('local', {
    successRedirect: '/', // Redirige a la página principal tras un login exitoso
    failureRedirect: '/login', // Redirige de nuevo al login si falla
    failureFlash: true // Opcional, para mensajes de flash
}));

// Rutas para autenticación con GitHub
router.get('/github', passport.authenticate('github'));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);
// Logout
router.post('/logout', (req, res) => {
    req.logout(); // Passport proporciona este método para cerrar sesión
    res.redirect('/login');
});

module.exports = router;
