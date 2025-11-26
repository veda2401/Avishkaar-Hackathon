const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cropName: { type: String, required: true },
    variety: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    location: {
        village: { type: String, default: 'Not specified' },
        district: { type: String, default: 'Not specified' },
        state: { type: String, default: 'Not specified' }
    },
    harvestDate: { type: Date, required: true },
    shelfLifeDays: { type: Number, required: true },
    expiryDate: { type: Date },
    status: {
        type: String,
        enum: ['available', 'sold', 'expired'],
        default: 'available'
    },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate expiry date
ProductSchema.pre('save', function (next) {
    if (this.harvestDate && this.shelfLifeDays) {
        const harvest = new Date(this.harvestDate);
        this.expiryDate = new Date(harvest.setDate(harvest.getDate() + this.shelfLifeDays));
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);
