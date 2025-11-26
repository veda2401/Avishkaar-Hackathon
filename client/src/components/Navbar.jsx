import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sprout, ShoppingCart, Truck, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
                    <Sprout size={28} />
                    <span>AgriConnect</span>
                </Link>
                <div className="flex items-center space-x-6">
                    {!user ? (
                        <>
                            <Link to="/login" className="hover:text-accent">Login</Link>
                            <Link to="/register" className="bg-white text-primary px-4 py-2 rounded-full font-semibold hover:bg-accent hover:text-primary transition">Register</Link>
                        </>
                    ) : (
                        <>
                            {user.role === 'farmer' && <Link to="/farmer" className="hover:text-accent">Dashboard</Link>}
                            {user.role === 'buyer' && (
                                <>
                                    <Link to="/buyer" className="hover:text-accent">Marketplace</Link>
                                    <Link to="/buyer/cart" className="hover:text-accent"><ShoppingCart /></Link>
                                </>
                            )}
                            {user.role === 'delivery' && <Link to="/delivery" className="hover:text-accent"><Truck /></Link>}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm opacity-80">Hello, {user.name}</span>
                                <button onClick={handleLogout} className="hover:text-red-300"><LogOut size={20} /></button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
