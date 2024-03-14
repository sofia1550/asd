const User = require('../../dao/models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('../../passportConfig'); 

exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ first_name, last_name, email, age, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).send('Token de recuperación inválido o expirado.');
    }

    if (await user.comparePassword(newPassword)) {
        return res.status(400).send('La nueva contraseña no puede ser igual a la contraseña actual.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Aquí podrías enviar un correo confirmando el cambio de contraseña

    res.send('Contraseña restablecida con éxito.');
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send('Usuario no encontrado.');
    }

    // Genera un token único (puedes usar `crypto` de Node.js para esto)
    const token = require('crypto').randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora en milisegundos
    await user.save();

    // Envía el email (puedes usar nodemailer)
    const resetUrl = `http://${req.headers.host}/reset/${token}`;
    // Aquí iría la lógica para enviar el correo con nodemailer u otro servicio, incluyendo resetUrl en el contenido

    res.send('Se ha enviado un enlace de recuperación de contraseña.');
};
exports.login = (req, res, next) => {
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
    })(req, res, next);
};

exports.getCurrentUser = (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: "No se pudo autenticar el usuario",
                error: err || info
            });
        }
        res.json({ user: req.user });
    })(req, res);
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/login');
};
