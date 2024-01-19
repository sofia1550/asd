const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('./dao/models/User'); // Asegúrate de que la ruta al modelo de User sea correcta
const bcrypt = require('bcrypt');

// Estrategia local para autenticación con email y contraseña
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Estrategia de GitHub para autenticación con GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/github/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Busca o crea un usuario en tu base de datos basándote en la información de perfil de GitHub
            let user = await User.findOne({ githubId: profile.id });
            if (!user) {
                user = new User({ githubId: profile.id, name: profile.displayName });
                await user.save();
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialización y deserialización del usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
