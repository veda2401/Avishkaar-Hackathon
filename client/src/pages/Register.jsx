import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'buyer',
        location: { address: '', city: '', state: '', zip: '' },
        phone: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        if (roleParam) setFormData(prev => ({ ...prev, role: roleParam }));
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register(formData);
            if (user.role === 'farmer') navigate('/farmer');
            else if (user.role === 'buyer') navigate('/buyer');
            else if (user.role === 'delivery') navigate('/delivery');
            else navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary">Create Account</h2>
                {error && <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="buyer">Buyer</option>
                            <option value="farmer">Farmer</option>
                            <option value="delivery">Delivery Partner</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" className="w-full p-2 border rounded-lg" required
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="w-full p-2 border rounded-lg" required
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" className="w-full p-2 border rounded-lg" required
                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" className="w-full p-2 border rounded-lg" required
                            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>

                    <div className="md:col-span-2 border-t pt-4 mt-2">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Location Details</h3>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" className="w-full p-2 border rounded-lg" required
                            value={formData.location.address} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" className="w-full p-2 border rounded-lg" required
                            value={formData.location.city} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" className="w-full p-2 border rounded-lg" required
                            value={formData.location.state} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="md:col-span-2 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-800 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </>
                        ) : (
                            'Register'
                        )}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
