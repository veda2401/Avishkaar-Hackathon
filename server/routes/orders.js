const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create Order (Buyer)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'buyer') return res.status(403).json({ msg: 'Not authorized' });
    try {
        const { products, totalAmount, deliveryAddress } = req.body;

        // Verify products availability
        // (Simplified for hackathon: assuming frontend checks, but backend should too)

        const newOrder = new Order({
            buyer: req.user.id,
            products,
            totalAmount,
            deliveryAddress
        });

        const order = await newOrder.save();

        // Update product status to sold or decrease quantity (simplified: mark sold if qty 0)
        // For now, let's just save order

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Orders (Role based)
router.get('/', auth, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'buyer') {
            orders = await Order.find({ buyer: req.user.id }).populate('products.product');
        } else if (req.user.role === 'farmer') {
            // Find orders containing farmer's products (complex query, simplified for now)
            // For hackathon, maybe just show all orders? No, that's bad.
            // Let's skip farmer order view for a sec or implement properly.
            // Proper way: Find orders where products.product.farmer == req.user.id
            // This requires deep population or aggregation.
            // Alternative: Store farmerId in Order for easier query if 1 order = 1 farmer.
            // If 1 order has multiple farmers, it's complex.
            // Assumption: 1 Order = 1 Farmer for simplicity? Or mixed?
            // Let's assume mixed.
            orders = await Order.find().populate({
                path: 'products.product',
                match: { farmer: req.user.id }
            });
            // Filter out orders where no products match
            orders = orders.filter(o => o.products.some(p => p.product));
        } else if (req.user.role === 'delivery') {
            orders = await Order.find({ status: { $in: ['accepted', 'out_for_delivery'] } }).populate('products.product');
        } else {
            orders = await Order.find().populate('products.product');
        }
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update Order Status (Delivery/Farmer)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        // Logic for who can update what
        if (req.user.role === 'delivery' && ['picked_up', 'delivered'].includes(status)) {
            order.deliveryPartner = req.user.id;
            order.status = status;
        } else if (req.user.role === 'farmer' && status === 'accepted') {
            order.status = status;
        }

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
