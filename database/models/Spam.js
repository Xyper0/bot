const mongoose = require('mongoose');

const antiSpamSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    isEnabled: { type: Boolean, default: false },  
});

module.exports = mongoose.model('AntiSpam', antiSpamSchema);
