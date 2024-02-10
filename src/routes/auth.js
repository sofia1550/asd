const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController'); // Asegúrate de actualizar la ruta según tu estructura de proyecto

// Registro de usuario
router.post('/register', authController.register);

// Login de usuario
router.post('/login', authController.login);

// Obtener el usuario actual basado en el JWT
router.get('/api/sessions/current', authController.getCurrentUser);

// Logout de usuario
router.post('/logout', authController.logout);

// Rutas para autenticación con GitHub
// Estas rutas permanecen sin cambios respecto a tu implementación original de Passport con GitHub
router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

module.exports = router;
