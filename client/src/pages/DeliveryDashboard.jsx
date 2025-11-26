import React, { useState, useEffect, useContext } from 'react';
import { MapPin, CheckCircle, Truck, Clock, Package } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
        window.addEventListener('deliveryOrdersUpdated', fetchOrders);
        window.addEventListener('storage', fetchOrders); // Listen for cross-tab updates
        return () => {
            window.removeEventListener('deliveryOrdersUpdated', fetchOrders);
            window.removeEventListener('storage', fetchOrders);
        };
    }, []);

    const fetchOrders = async () => {
        // Load orders from localStorage
        const deliveryOrders = JSON.parse(localStorage.getItem('deliveryOrders') || '[]');
        console.log('Fetched orders:', deliveryOrders); // Debugging
        setOrders(deliveryOrders);
    };

    const updateStatus = (id, status) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to update delivery status.');
            window.location.href = '/login';
            return;
        }

        const updatedOrders = orders.map(order =>
            order._id === id ? { ...order, status } : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('deliveryOrders', JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event('deliveryOrdersUpdated')); // Notify other components
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'out_for_delivery': return 'bg-blue-100 text-blue-700';
            case 'accepted': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Separate active and completed orders
    const activeOrders = orders.filter(order => order.status !== 'delivered');
    const completedOrders = orders.filter(order => order.status === 'delivered');

    const renderOrderCard = (order) => (
        <div key={order._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition">
            <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">Order #{order._id.slice(-6)}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-2xl text-primary">₹{order.totalAmount}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Package className="text-blue-600" size={20} />
                    <div>
                        <p className="font-semibold text-gray-800">{order.products[0]?.product?.cropName}</p>
                        <p className="text-sm text-gray-600">{order.products[0]?.quantity} kg</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <MapPin className="text-red-600" size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700">PICKUP FROM</p>
                        <p className="font-semibold text-gray-800">{order.pickupAddress?.farmerName}</p>
                        <p className="text-sm text-gray-600">{order.pickupAddress?.address}</p>
                        <p className="text-sm text-gray-600">{order.pickupAddress?.city}, {order.pickupAddress?.state}</p>
                        <p className="text-sm text-blue-600 font-medium mt-1">📞 {order.pickupAddress?.phone}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                        <MapPin className="text-green-600" size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700">DELIVER TO</p>
                        <p className="font-semibold text-gray-800">{order.deliveryAddress?.buyerName}</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress?.address}</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                        <p className="text-sm text-blue-600 font-medium mt-1">📞 {order.deliveryAddress?.phone}</p>
                    </div>
                </div>

                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">{order.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">~{order.estimatedTime}</span>
                    </div>
                </div>

                {order.status !== 'delivered' && (
                    <div className="flex gap-2 pt-2">
                        {order.status === 'pending' && (
                            <button
                                onClick={() => updateStatus(order._id, 'accepted')}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition"
                            >
                                Accept Job
                            </button>
                        )}
                        {order.status === 'accepted' && (
                            <button
                                onClick={() => updateStatus(order._id, 'out_for_delivery')}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <Truck size={18} /> Start Delivery
                            </button>
                        )}
                        {order.status === 'out_for_delivery' && (
                            <button
                                onClick={() => updateStatus(order._id, 'delivered')}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} /> Mark Delivered
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Delivery Jobs</h1>
                    <p className="text-gray-600 mt-2">Manage your delivery orders and routes</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-800 transition flex items-center gap-2"
                >
                    <Truck size={20} /> Refresh Orders
                </button>
            </div>

            {/* Active Deliveries */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Deliveries</h2>
                {activeOrders.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
                        <Truck size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No active delivery orders. Orders will appear here when buyers checkout.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {activeOrders.map(order => renderOrderCard(order))}
                    </div>
                )}
            </div>

            {/* Past Deliveries */}
            {completedOrders.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={28} className="text-green-600" />
                        Past Deliveries
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 opacity-75">
                        {completedOrders.map(order => renderOrderCard(order))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDashboard;
