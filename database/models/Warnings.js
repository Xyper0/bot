const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    chatId: { type: String, required: true },  
    userId: { type: String, required: true }, 
    warnings: { type: Number, default: 0},
    reason: { type:String , required:false },  
    isBanned: { type: Boolean, default: false },
});



module.exports = mongoose.model('Warning', warningSchema);


