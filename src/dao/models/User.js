const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true, required: true },
    age: Number,
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }, 
    role: { type: String, enum: ['user', 'admin', 'premium'], default: 'user' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
