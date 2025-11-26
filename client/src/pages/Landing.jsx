import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShoppingBag, Truck } from 'lucide-react';

const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-green-50 to-white">
            <div className="text-center max-w-3xl px-6">
                <h1 className="text-5xl font-bold text-primary mb-6">Direct from Farm to Table</h1>
                <p className="text-xl text-gray-600 mb-10">
                    Empowering farmers, connecting buyers, and ensuring fresh produce delivery.
                    No middlemen, fair prices, and transparent quality.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <Link to="/register?role=farmer" className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-green-100">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition">
                            <Sprout size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">For Farmers</h3>
                        <p className="text-gray-500">List produce, get market insights, and sell directly.</p>
                    </Link>

                    <Link to="/register?role=buyer" className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-green-100">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary group-hover:text-white transition">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">For Buyers</h3>
                        <p className="text-gray-500">Buy fresh, track expiry, and enjoy fair prices.</p>
                    </Link>

                    <Link to="/register?role=delivery" className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-green-100">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                            <Truck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Delivery Partners</h3>
                        <p className="text-gray-500">Earn by delivering fresh produce to local buyers.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
