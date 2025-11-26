const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        priceAtPurchase: Number
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveryAddress: {
        address: String,
        city: String,
        zip: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
