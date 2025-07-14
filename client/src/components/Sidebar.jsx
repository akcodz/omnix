import React from 'react';
import {Protect, useClerk, useUser} from '@clerk/clerk-react';
import {
    Eraser,
    FileText,
    Hash,
    House,
    Scissors,
    SquarePen,
    Users,
    Image, LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/ai', label: 'Dashboard', Icon: House },
    { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
    { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
    { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
    { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
    { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
    { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
    { to: '/ai/community', label: 'Community', Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();

    return (
        <div
            className={`
        w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center
        max-sm:absolute top-14 bottom-0 
        transition-all duration-300 ease-in-out 
        ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'}
      `}
        >
            {/* User Info */}
            <div className="my-7 w-full">
                <img
                    src={user.imageUrl}
                    alt="User avatar"
                    className="w-12 h-12 rounded-full mx-auto object-cover"
                />
                <h1 className="mt-2 text-center text-sm font-medium text-slate-700">
                    {user.fullName}
                </h1>


            {/* Navigation */}
            <div className="px-6 mt-9 text-sm text-gray-600 font-medium">
                {navItems.map(({ to, label, Icon }, index) => (
                    <NavLink
                        key={index}
                        to={to}
                        end={to === '/ai'}
                        onClick={() => setSidebar(false)}
                        className={({ isActive }) =>
                            `px-3.5 py-2.5 flex items-center gap-3 rounded transition-colors duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    className={`h-4 w-4 ${
                                        isActive ? 'text-white' : 'text-gray-600'
                                    }`}
                                />
                                <span className="text-sm">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
            </div>
            <div className="w-full border-t border-gray-200 p-4 px-7 flex Items-center justify-between">
                {/* User Info */}
                <div onClick={openUserProfile} className="flex gap-2 items-center cursor-pointer">
                    <img
                        src={user.imageUrl}
                        className="w-8 h-8 rounded-full object-cover"
                        alt="User avatar"
                    />
                    <div>
                        <h1 className="text-sm font-medium text-slate-700">{user.fullName}</h1>
                        <p className="text-xs text-gray-500">
                            <Protect plan="premium" fallback="Free">Premium</Protect> Plan
                        </p>
                    </div>
                </div>

                {/* Logout Icon */}
                <LogOut
                    onClick={signOut}
                    className="w-5 h-5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                />
            </div>
        </div>
    );
};

export default Sidebar;
