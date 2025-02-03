const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    closeTime: { type: String, required: true },
    openTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Schedule', scheduleSchema);