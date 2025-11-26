const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'delivery', 'admin'],
        default: 'buyer'
    },
    location: {
        address: String,
        city: String,
        state: String,
        zip: String
    },
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
