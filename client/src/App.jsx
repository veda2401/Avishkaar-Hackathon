import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerMarketplace from './pages/BuyerMarketplace';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Cart from './pages/Cart';
import Navbar from './components/Navbar';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/farmer" element={<FarmerDashboard />} />
                        <Route path="/buyer" element={<BuyerMarketplace />} />
                        <Route path="/buyer/cart" element={<Cart />} />
                        <Route path="/delivery" element={<DeliveryDashboard />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
