const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true }, // 'required' se elimina y se agrega 'sparse' para índices únicos parcialmente densos
    password: { type: String },
    role: { type: String, default: 'user' }, // roles pueden ser 'user' o 'admin'
    githubId: { type: String, unique: true, sparse: true } // Campo adicional para almacenar el ID de GitHub
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return candidatePassword ? bcrypt.compare(candidatePassword, this.password) : false;
};

module.exports = mongoose.model('User', userSchema);
