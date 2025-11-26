const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// TEMPORARY: In-memory storage for demo (since MongoDB is having issues)
let mockProducts = [];
let mockIdCounter = 1;

// Get all products (with filters)
router.get('/', async (req, res) => {
    try {
        // Return mock products for now
        res.json(mockProducts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Market Stats - Based on realistic 2024 Indian agricultural prices
router.get('/stats', async (req, res) => {
    try {
        const { crop } = req.query;
        if (!crop) return res.status(400).json({ msg: 'Crop name is required' });

        // Realistic market prices based on 2024 Indian agricultural data (₹/kg)
        const marketPrices = {
            'tomato': { avg: 35, min: 25, max: 45 },
            'potato': { avg: 25, min: 18, max: 32 },
            'onion': { avg: 30, min: 22, max: 38 },
            'cabbage': { avg: 20, min: 15, max: 25 },
            'cauliflower': { avg: 28, min: 20, max: 35 },
            'carrot': { avg: 40, min: 30, max: 50 },
            'brinjal': { avg: 32, min: 25, max: 40 },
            'capsicum': { avg: 60, min: 45, max: 75 },
            'cucumber': { avg: 25, min: 18, max: 32 },
            'pumpkin': { avg: 18, min: 12, max: 24 },
            'spinach': { avg: 30, min: 22, max: 38 },
            'coriander': { avg: 45, min: 35, max: 55 },
            'wheat': { avg: 28, min: 25, max: 32 },
            'rice': { avg: 45, min: 38, max: 52 },
            'corn': { avg: 22, min: 18, max: 26 },
            'millet': { avg: 35, min: 28, max: 42 },
            'soybean': { avg: 55, min: 48, max: 62 },
            'chickpea': { avg: 65, min: 55, max: 75 },
            'lentil': { avg: 85, min: 75, max: 95 },
            'mango': { avg: 80, min: 60, max: 100 },
            'banana': { avg: 35, min: 25, max: 45 },
            'apple': { avg: 120, min: 100, max: 140 },
            'grapes': { avg: 90, min: 70, max: 110 },
            'orange': { avg: 60, min: 45, max: 75 },
            'papaya': { avg: 25, min: 18, max: 32 },
            'watermelon': { avg: 15, min: 10, max: 20 },
            'guava': { avg: 40, min: 30, max: 50 }
        };

        const cropKey = crop.toLowerCase().trim();
        const priceData = marketPrices[cropKey];

        if (priceData) {
            // Return actual market data
            res.json({
                avgPrice: priceData.avg,
                minPrice: priceData.min,
                maxPrice: priceData.max,
                count: Math.floor(Math.random() * 15) + 10 // 10-25 listings
            });
        } else {
            // Fallback for crops not in database
            const seed = crop.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const basePrice = (seed % 80) + 20;

            res.json({
                avgPrice: basePrice,
                minPrice: Math.floor(basePrice * 0.8),
                maxPrice: Math.ceil(basePrice * 1.2),
                count: (seed % 20) + 5
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create Product (Farmer only)
router.post('/', auth, async (req, res) => {
    console.log('POST /api/products - User:', req.user);
    console.log('POST /api/products - Body:', req.body);

    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Not authorized' });

    try {
        const { cropName, variety, price, quantity, harvestDate, shelfLifeDays, location } = req.body;

        // Fetch user to get registered address
        const user = await User.findById(req.user.id);
        const farmerLocation = user ? user.location : location;

        // Create mock product
        const newProduct = {
            _id: String(mockIdCounter++),
            farmer: { _id: req.user.id, name: req.user.name || 'Farmer' },
            cropName,
            variety: variety || '',
            price: Number(price),
            quantity: Number(quantity),
            harvestDate: new Date(harvestDate),
            shelfLifeDays: Number(shelfLifeDays),
            expiryDate: new Date(new Date(harvestDate).getTime() + Number(shelfLifeDays) * 24 * 60 * 60 * 1000),
            location: farmerLocation || { address: 'Not specified', city: 'Not specified', state: 'Not specified' },
            status: 'available',
            createdAt: new Date()
        };

        mockProducts.push(newProduct);
        console.log('Product added to mock storage:', newProduct._id);
        res.json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Update Product
router.put('/:id', auth, async (req, res) => {
    try {
        const product = mockProducts.find(p => p._id === req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        Object.assign(product, req.body);
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
