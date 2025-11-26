import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Filter, ShoppingCart, Clock, X, MapPin, User } from 'lucide-react';

const BuyerMarketplace = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ crop: '', maxPrice: '', shelfLife: '' });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);

    // Load products and cart on mount / when filters change
    useEffect(() => {
        fetchProducts();
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, [filters]);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.crop) params.append('crop', filters.crop);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.shelfLife) params.append('shelfLife', filters.shelfLife);
            const res = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getExpiryStatus = (expiryDate) => {
        const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return { text: 'Expired', color: 'bg-gray-200 text-gray-500' };
        if (daysLeft <= 2) return { text: `${daysLeft} days left`, color: 'bg-red-100 text-red-600' };
        return { text: `${daysLeft} days left`, color: 'bg-green-100 text-green-600' };
    };

    const openAddToCartModal = (product) => {
        // Check if cart has items from another farmer
        if (cart.length > 0) {
            const currentFarmerId = cart[0].product.farmer._id;
            if (product.farmer._id !== currentFarmerId) {
                alert(`You can only order from one farmer at a time.\n\nCurrent cart: ${cart[0].product.farmer.name}\nThis product: ${product.farmer.name}\n\nPlease clear your cart or checkout first.`);
                return;
            }
        }
        setSelectedProduct(product);
        setQuantity(1);
    };

    const addToCart = () => {
        if (!selectedProduct) return;
        const cartItem = {
            product: selectedProduct,
            quantity: Number(quantity),
            totalPrice: selectedProduct.price * Number(quantity),
        };
        const updatedCart = [...cart, cartItem];
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Decrease product quantity in UI (optimistic update)
        setProducts(products.map(p =>
            p._id === selectedProduct._id
                ? { ...p, quantity: p.quantity - Number(quantity) }
                : p
        ));

        alert(`Added ${quantity} ${selectedProduct.unit || 'kg'} of ${selectedProduct.cropName} to cart!`);
        setSelectedProduct(null);
        setQuantity(1);
    };

    // Group products by farmer
    const groupedProducts = products.reduce((acc, product) => {
        const farmerId = product.farmer._id;
        if (!acc[farmerId]) {
            acc[farmerId] = {
                farmer: product.farmer,
                location: product.location,
                products: []
            };
        }
        acc[farmerId].products.push(product);
        return acc;
    }, {});

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Fresh Produce Marketplace</h1>
                <Link to="/buyer/cart" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800">
                    <ShoppingCart size={20} />
                    Cart ({cart.length})
                </Link>
            </div>

            {/* Main layout */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 space-y-6 h-fit sticky top-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Filters
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Crop Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded text-sm"
                                    value={filters.crop}
                                    onChange={e => setFilters({ ...filters, crop: e.target.value })}
                                    placeholder="Search..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded text-sm"
                                    value={filters.maxPrice}
                                    onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                                    placeholder="₹"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Shelf Life</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={filters.shelfLife}
                                    onChange={e => setFilters({ ...filters, shelfLife: e.target.value })}
                                >
                                    <option value="">Any</option>
                                    <option value="short">Short (Perishable)</option>
                                    <option value="long">Long (Grains)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product List Grouped by Farmer */}
                <div className="flex-1 space-y-8">
                    {Object.values(groupedProducts).length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                        </div>
                    ) : (
                        Object.values(groupedProducts).map((group) => (
                            <div key={group.farmer._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                {/* Farmer Header */}
                                <div className="bg-green-50 p-4 border-b flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-full shadow-sm">
                                            <User size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">{group.farmer.name}'s Farm</h2>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin size={14} />
                                                {group.location?.city || group.location?.district || 'Location not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-green-700 font-medium bg-green-100 px-3 py-1 rounded-full">
                                        {group.products.length} items available
                                    </div>
                                </div>

                                {/* Farmer's Products Grid */}
                                <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {group.products.map(product => {
                                        const expiry = getExpiryStatus(product.expiryDate);
                                        return (
                                            <div key={product._id} className="bg-white rounded-xl border hover:shadow-md transition overflow-hidden group">
                                                <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                                                    <span className="text-5xl">🌾</span>
                                                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${expiry.color} flex items-center gap-1`}>
                                                        <Clock size={12} /> {expiry.text}
                                                    </span>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{product.cropName}</h3>
                                                    <p className="text-sm text-gray-600 font-medium mb-3">
                                                        📦 {product.quantity} {product.unit || 'kg'} available
                                                    </p>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <span className="text-xl font-bold text-primary">₹{product.price}</span>
                                                            <span className="text-xs text-gray-400">/{product.unit || 'kg'}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => openAddToCartModal(product)}
                                                            className={`px-3 py-1.5 rounded-lg transition text-sm flex items-center gap-1 ${product.quantity === 0 || expiry.text === 'Expired' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-green-800'}`}
                                                            disabled={product.quantity === 0 || expiry.text === 'Expired'}
                                                        >
                                                            <ShoppingCart size={16} />
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add to Cart Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Add to Cart</h3>
                            <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">{selectedProduct.cropName}</h4>
                            <p className="text-sm text-gray-600">From {selectedProduct.farmer.name}</p>
                            <p className="text-sm text-gray-500">
                                Available: {selectedProduct.quantity} {selectedProduct.unit || 'kg'}
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                How many {selectedProduct.unit || 'kg'} do you want?
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedProduct.quantity}
                                value={quantity}
                                onChange={e => setQuantity(Math.min(e.target.value, selectedProduct.quantity))}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg font-semibold focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Price per {selectedProduct.unit || 'kg'}:</span>
                                <span className="font-semibold">₹{selectedProduct.price}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-semibold">{quantity} {selectedProduct.unit || 'kg'}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-bold text-lg">Total:</span>
                                    <span className="font-bold text-2xl text-primary">₹{selectedProduct.price * quantity}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={addToCart}
                            className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-green-800 transition"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerMarketplace;
