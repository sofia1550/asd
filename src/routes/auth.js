const express = require('express');
const router = express.Router();
const passport = require('passport'); 
const authController = require('./controllers/authController'); 

// Registro de usuario
router.post('/register', authController.register);

// Login de usuario
router.post('/login', authController.login);

// Solicitar el restablecimiento de la contraseña
router.post('/forgot-password', authController.forgotPassword);

// Restablecer la contraseña
router.post('/reset-password', authController.resetPassword);

// Obtener el usuario actual basado en el JWT
router.get('/api/sessions/current', authController.getCurrentUser);

// Logout de usuario
router.post('/logout', authController.logout);

// Cambiar el rol del usuario a premium y viceversa
router.patch('/premium/:uid', authController.changeUserRole);

// Rutas para autenticación con GitHub
router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

module.exports = router;
