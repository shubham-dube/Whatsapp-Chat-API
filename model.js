// models/Message.js
//
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    status: { type: String, required: true },
    message: { type: String, required: true },
    messageBody: { type: String, required: true },
    sender_Number: { type: String, required: true }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
