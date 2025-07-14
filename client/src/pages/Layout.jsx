import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import { useUser, SignIn } from '@clerk/clerk-react';

const Layout = () => {
    const navigate = useNavigate();
    const [sidebar, setSidebar] = useState(false);
    const { user } = useUser();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F4F7FB]">
                <SignIn />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen items-start justify-start">
            {/* Navbar */}
            <nav className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200">
                <img
                    src={assets.logo}
                    alt="logo"
                    className="w-28 sm:w-36 cursor-pointer"
                    onClick={() => navigate('/')}
                />

                <div className="sm:hidden cursor-pointer">
                    {sidebar ? (
                        <X className="w-6 h-6 text-gray-600" onClick={() => setSidebar(false)} />
                    ) : (
                        <Menu className="w-6 h-6 text-gray-600" onClick={() => setSidebar(true)} />
                    )}
                </div>
            </nav>

            {/* Sidebar and Main Content */}
            <div className="flex flex-1 w-full h-[calc(100vh-56px)]">
                <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
                <main className="flex-1 bg-[#F4F7FB] overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
