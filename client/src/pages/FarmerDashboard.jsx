import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, TrendingUp, AlertTriangle, DollarSign, Package } from 'lucide-react';

const FarmerDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        cropName: '', variety: '', price: '', quantity: '',
        harvestDate: '', shelfLifeDays: '', location: { village: '', district: '', state: '' }
    });
    const [marketStats, setMarketStats] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [earnings, setEarnings] = useState({ total: 0, delivered: 0 });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Wait for auth to complete before fetching data
        if (authLoading) {
            return;
        }

        if (!user || !user.id) {
            setIsInitialLoad(false);
            return;
        }

        const loadData = async () => {
            await fetchProducts();
            fetchEarnings();
            setIsInitialLoad(false);
        };

        loadData();

        // Listen for delivery updates
        window.addEventListener('deliveryOrdersUpdated', fetchEarnings);
        return () => {
            window.removeEventListener('deliveryOrdersUpdated', fetchEarnings);
        };
    }, [user, authLoading]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            if (user && user.id) {
                const farmerProducts = res.data.filter(p => p.farmer && p.farmer._id === user.id);
                setProducts(farmerProducts);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
        }
    };

    const fetchEarnings = () => {
        if (!user || !user.id) return;

        const deliveryOrders = JSON.parse(localStorage.getItem('deliveryOrders') || '[]');

        // Filter orders where this farmer is the seller and delivery is completed
        const farmerOrders = deliveryOrders.filter(order =>
            order.products.some(p => p.product.farmer._id === user.id)
        );

        const deliveredOrders = farmerOrders.filter(order => order.status === 'delivered');

        const totalEarnings = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        setEarnings({
            total: totalEarnings,
            delivered: deliveredOrders.length
        });
    };

    const handleCropChange = async (e) => {
        const crop = e.target.value;
        setNewProduct({ ...newProduct, cropName: crop });
        if (crop.length > 2) {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/stats?crop=${crop}`);
                setMarketStats(res.data);
            } catch (err) {
                setMarketStats(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in again to continue.');
                window.location.href = '/login';
                return;
            }

            await axios.post('http://localhost:5000/api/products', {
                ...newProduct,
                location: {
                    village: newProduct.location.village || 'Not specified',
                    district: newProduct.location.district || 'Not specified',
                    state: newProduct.location.state || 'Not specified'
                }
            }, { headers: { 'x-auth-token': token } });

            setShowAddForm(false);
            setNewProduct({
                cropName: '', variety: '', price: '', quantity: '',
                harvestDate: '', shelfLifeDays: '', location: { village: '', district: '', state: '' }
            });
            setMarketStats(null);
            fetchProducts();
        } catch (err) {
            console.error('Error submitting product:', err);
            if (err.response && err.response.status === 401) {
                alert('Your session has expired. Please log in again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                alert('Failed to add product. Please try again.');
            }
        }
    };

    const handleEditClick = async (product) => {
        setEditingProduct(product);
        // Fetch stats for the product being edited
        try {
            const res = await axios.get(`http://localhost:5000/api/products/stats?crop=${product.cropName}`);
            setMarketStats(res.data);
        } catch (err) {
            setMarketStats(null);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in again to continue.');
                window.location.href = '/login';
                return;
            }

            await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, {
                price: editingProduct.price,
                quantity: editingProduct.quantity
            }, { headers: { 'x-auth-token': token } });

            setEditingProduct(null);
            setMarketStats(null);
            fetchProducts();
            alert('Product updated successfully!');
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Failed to update product');
        }
    };

    // Show loading state only while auth is loading
    if (authLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if user is not authenticated
    if (!user || !user.id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-red-600 text-lg mb-4">Please log in to access your dashboard.</p>
                        <a href="/login" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-800">
                            Go to Login
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Farm Dashboard</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800"
                >
                    <Plus size={20} /> Add Produce
                </button>
            </div>

            {/* Earnings Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold opacity-90">Total Earnings</h3>
                        <DollarSign size={32} className="opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-1">₹{earnings.total.toLocaleString()}</p>
                    <p className="text-sm opacity-75">From delivered orders</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold opacity-90">Completed Deliveries</h3>
                        <Package size={32} className="opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-1">{earnings.delivered}</p>
                    <p className="text-sm opacity-75">Successfully delivered</p>
                </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Edit {editingProduct.cropName}</h2>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-gray-700">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <form onSubmit={handleUpdateProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (₹/{editingProduct.unit || 'kg'})</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg"
                                        value={editingProduct.price}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Quantity ({editingProduct.unit || 'kg'})</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg"
                                        value={editingProduct.quantity}
                                        onChange={e => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition">
                                        Update Stock & Price
                                    </button>
                                </div>
                            </form>

                            {/* Market Insight Panel (Reused) */}
                            <div className="bg-blue-50 p-6 rounded-xl h-fit">
                                <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4">
                                    <TrendingUp size={20} /> Market Insights
                                </h3>
                                {marketStats && marketStats.avgPrice ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-blue-700">
                                            Current market data for <strong>{editingProduct.cropName}</strong>:
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-white p-2 rounded shadow-sm">
                                                <span className="block text-xs text-gray-500">Min</span>
                                                <span className="font-bold text-green-600">₹{marketStats.minPrice}</span>
                                            </div>
                                            <div className="bg-white p-2 rounded shadow-sm border-blue-200 border">
                                                <span className="block text-xs text-gray-500">Avg</span>
                                                <span className="font-bold text-blue-600">₹{marketStats.avgPrice.toFixed(1)}</span>
                                            </div>
                                            <div className="bg-white p-2 rounded shadow-sm">
                                                <span className="block text-xs text-gray-500">Max</span>
                                                <span className="font-bold text-red-600">₹{marketStats.maxPrice}</span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg text-sm ${Number(editingProduct.price) > marketStats.avgPrice * 1.2 ? 'bg-red-100 text-red-700' :
                                            Number(editingProduct.price) < marketStats.avgPrice * 0.8 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {Number(editingProduct.price) > marketStats.avgPrice * 1.2 ? (
                                                <span className="flex items-start gap-2"><AlertTriangle size={16} className="mt-1" /> Price is high vs market avg.</span>
                                            ) : Number(editingProduct.price) < marketStats.avgPrice * 0.8 ? (
                                                <span className="flex items-start gap-2"><TrendingUp size={16} className="mt-1" /> Price is very competitive!</span>
                                            ) : (
                                                <span className="flex items-start gap-2">✅ Fair market price.</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Loading market data...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-green-100">
                    <h2 className="text-xl font-bold mb-4">List New Produce</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Crop Name</label>
                                <input type="text" className="w-full p-2 border rounded"
                                    value={newProduct.cropName} onChange={handleCropChange} required placeholder="e.g. Tomato" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Price (₹/unit)</label>
                                    <input type="number" className="w-full p-2 border rounded"
                                        value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Quantity</label>
                                    <input type="number" className="w-full p-2 border rounded"
                                        value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Unit</label>
                                <select className="w-full p-2 border rounded"
                                    value={newProduct.unit || 'kg'} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="pieces">Pieces (pcs)</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="bunch">Bunch</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Harvest Date</label>
                                    <input type="date" className="w-full p-2 border rounded"
                                        value={newProduct.harvestDate} onChange={e => setNewProduct({ ...newProduct, harvestDate: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Shelf Life (Days)</label>
                                    <input type="number" className="w-full p-2 border rounded"
                                        value={newProduct.shelfLifeDays} onChange={e => setNewProduct({ ...newProduct, shelfLifeDays: e.target.value })} required />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-secondary text-white py-2 rounded font-semibold">Post Listing</button>
                        </form>

                        {/* Market Insight Panel */}
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2 mb-4">
                                <TrendingUp size={20} /> Market Insights
                            </h3>
                            {marketStats && marketStats.avgPrice ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-blue-700">
                                        Market data for <strong>{newProduct.cropName}</strong> in your area:
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-white p-2 rounded shadow-sm">
                                            <span className="block text-xs text-gray-500">Min</span>
                                            <span className="font-bold text-green-600">₹{marketStats.minPrice}</span>
                                        </div>
                                        <div className="bg-white p-2 rounded shadow-sm border-blue-200 border">
                                            <span className="block text-xs text-gray-500">Avg</span>
                                            <span className="font-bold text-blue-600">₹{marketStats.avgPrice.toFixed(1)}</span>
                                        </div>
                                        <div className="bg-white p-2 rounded shadow-sm">
                                            <span className="block text-xs text-gray-500">Max</span>
                                            <span className="font-bold text-red-600">₹{marketStats.maxPrice}</span>
                                        </div>
                                    </div>
                                    {newProduct.price && (
                                        <div className={`p-3 rounded-lg text-sm ${Number(newProduct.price) > marketStats.avgPrice * 1.2 ? 'bg-red-100 text-red-700' :
                                            Number(newProduct.price) < marketStats.avgPrice * 0.8 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {Number(newProduct.price) > marketStats.avgPrice * 1.2 ? (
                                                <span className="flex items-start gap-2"><AlertTriangle size={16} className="mt-1" /> Your price is high. Consider lowering to ₹{marketStats.avgPrice.toFixed(0)} for faster sales.</span>
                                            ) : Number(newProduct.price) < marketStats.avgPrice * 0.8 ? (
                                                <span className="flex items-start gap-2"><TrendingUp size={16} className="mt-1" /> Your price is low. You could earn more!</span>
                                            ) : (
                                                <span className="flex items-start gap-2">✅ Competitive price! Good luck.</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Enter a crop name to see market prices.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Listed</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first produce to the marketplace!</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 inline-flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product._id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{product.cropName}</h3>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{product.status}</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">{product.variety}</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-2xl font-bold text-primary">₹{product.price}<span className="text-sm text-gray-400">/{product.unit || 'kg'}</span></span>
                                <span className="text-gray-600">{product.quantity} {product.unit || 'kg'} left</span>
                            </div>
                            <div className="text-sm text-gray-500 border-t pt-4 mb-4">
                                <p>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</p>
                                <p className="text-red-500">Expires: {new Date(product.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => handleEditClick(product)}
                                className="w-full border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                            >
                                Edit Stock & Price
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
