// dao/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now } // O puedes usar timestamps como en Product.js
});

module.exports = mongoose.model('Message', messageSchema);
