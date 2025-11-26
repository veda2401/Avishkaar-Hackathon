import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [deliveryAddress, setDeliveryAddress] = useState({
        address: '',
        city: '',
        state: 'Maharashtra'
    });
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    const removeFromCart = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const getTotalAmount = () => {
        return cart.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const handleCheckout = () => {
        if (!deliveryAddress.address || !deliveryAddress.city) {
            alert('Please enter delivery address');
            return;
        }

        // Create order and add to delivery queue
        const order = {
            _id: Date.now().toString(),
            status: 'pending',
            totalAmount: getTotalAmount(),
            products: cart.map(item => ({
                product: {
                    cropName: item.product.cropName,
                    quantity: item.quantity
                },
                quantity: item.quantity
            })),
            pickupAddress: {
                farmerName: cart[0]?.product.farmer.name || 'Farmer',
                address: cart[0]?.product.location.address || 'Farm Location',
                city: cart[0]?.product.location.city || cart[0]?.product.location.district || 'Pune',
                state: cart[0]?.product.location.state || 'Maharashtra',
                phone: cart[0]?.product.farmer.phone || '+91 98765 43210'
            },
            deliveryAddress: {
                buyerName: user?.name || 'Buyer',
                address: deliveryAddress.address,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                phone: '+91 98123 45678'
            },
            distance: `${(Math.random() * 28 + 2).toFixed(1)} km`,
            estimatedTime: `${Math.floor(Math.random() * 60 + 30)} mins`,
            createdAt: new Date()
        };

        // Save order to delivery queue
        console.log('Saving order to localStorage:', order);
        const deliveryOrders = JSON.parse(localStorage.getItem('deliveryOrders') || '[]');
        deliveryOrders.push(order);
        localStorage.setItem('deliveryOrders', JSON.stringify(deliveryOrders));
        console.log('Updated deliveryOrders in localStorage:', deliveryOrders);
        window.dispatchEvent(new Event('deliveryOrdersUpdated'));

        // Clear cart
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));

        alert('Order placed successfully! A delivery partner will pick it up soon.');
        navigate('/buyer');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <ShoppingBag size={32} />
                Your Cart
            </h1>

            {cart.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
                    <a href="/buyer" className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-800">
                        Browse Products
                    </a>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">{item.product.cropName}</h3>
                                    <p className="text-sm text-gray-600">From {item.product.farmer.name}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {item.quantity} kg × ₹{item.product.price}/kg
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className="text-2xl font-bold text-primary">₹{item.totalPrice}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold">₹{getTotalAmount()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery:</span>
                                    <span className="font-semibold text-green-600">Free</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-lg">Total:</span>
                                        <span className="font-bold text-2xl text-primary">₹{getTotalAmount()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-3">Delivery Address</h4>
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={deliveryAddress.address}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={deliveryAddress.city}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={deliveryAddress.state}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-green-800 transition"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
