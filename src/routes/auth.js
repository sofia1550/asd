// routes/auth.js
const express = require('express');
const User = require('../dao/models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({ email, password });
        await newUser.save();
        // Aquí puedes redirigir o enviar una respuesta exitosa
        res.status(201).json({ success: true, userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log(req.body); // Imprimir los datos recibidos

    try {
        const { email, password } = req.body;

        // Verificar si es un login de administrador
        if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            // Configurar sesión de administrador
            req.session.user = { email, role: 'admin' };
            return res.status(200).json({ success: true, message: "Login de administrador exitoso" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).send('Usuario o contraseña incorrectos');

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            req.session.user = { id: user._id, email: user.email, role: user.role };
            res.status(200).json({ success: true, message: "Login exitoso" });
        } else {
            res.status(401).send('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("No se pudo cerrar la sesión");
        }
        res.redirect('/login');
    });
});


module.exports = router;
