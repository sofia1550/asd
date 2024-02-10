const User = require('../../dao/models/User'); // Actualiza la ruta según tu estructura
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('../../passportConfig'); // Asegúrate de que la ruta sea correcta

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
