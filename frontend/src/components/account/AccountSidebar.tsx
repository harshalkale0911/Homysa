// frontend/src/components/account/AccountSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Package, Lock, LogOut } from 'lucide-react';

// Define props, including the logout handler function
interface AccountSidebarProps {
    onLogout: () => void; // Function passed from AccountPage to handle logout logic
    isLoadingLogout: boolean; // State to disable button during logout
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ onLogout, isLoadingLogout }) => {

    // Consistent base classes for links and buttons
    const baseClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 w-full"; // Added w-full for button consistency
    const activeClasses = "bg-primary/10 text-primary";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    const dangerClasses = "text-red-600 hover:bg-red-50 hover:text-red-700"; // For logout

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

    return (
        // Added h-full to ensure it fills vertical space if parent allows
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
            <nav className="flex flex-col space-y-1">
                <NavLink to="/account/profile" end className={getNavLinkClass}>
                    <User size={18} className="mr-3 flex-shrink-0" />
                    <span>Profile</span>
                </NavLink>
                <NavLink to="/account/orders" className={getNavLinkClass}>
                    <Package size={18} className="mr-3 flex-shrink-0" />
                    <span>My Orders</span>
                </NavLink>
                <NavLink to="/account/change-password" className={getNavLinkClass}>
                    <Lock size={18} className="mr-3 flex-shrink-0" />
                    <span>Change Password</span>
                </NavLink>
                {/* Placeholder for future links */}
                {/* <NavLink to="/account/addresses" className={getNavLinkClass}>...</NavLink> */}
                {/* <NavLink to="/account/wishlist" className={getNavLinkClass}>...</NavLink> */}

                <hr className="my-2 border-gray-200" />

                <button
                    onClick={onLogout}
                    disabled={isLoadingLogout}
                    className={`${baseClasses} ${dangerClasses} disabled:opacity-50 disabled:cursor-wait`} // Applied base and danger classes
                    aria-live="polite" // Announce changes when loading
                >
                    <LogOut size={18} className="mr-3 flex-shrink-0" />
                    <span>{isLoadingLogout ? 'Logging out...' : 'Logout'}</span>
                </button>
            </nav>
        </div>
    );
};

export default AccountSidebar;