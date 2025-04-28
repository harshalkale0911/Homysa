// frontend/src/components/admin/AdminSidebar.tsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Mail, MessageSquare, Settings, LogOut } from 'lucide-react'; // Use PenTool or another icon for Custom Orders if MessageSquare used elsewhere

// --- TODO: Replace with actual logout logic from auth context/state ---
const useAdminAuth = () => {
    const navigate = useNavigate();
    const logout = async () => {
        console.log("Admin Logout Triggered (Simulation)");
        // await fetch('/api/v1/logout', { method: 'GET', credentials: 'include' });
        // Clear local auth state/context
        navigate('/auth'); // Redirect to login after logout
    };
    return { logout };
}
// --- End Placeholder ---


const AdminSidebar: React.FC = () => {
    const { logout } = useAdminAuth(); // Get logout function

    // Define base classes for NavLink and Button for consistency
    const baseLinkClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 group";
    const activeLinkClasses = "bg-primary text-white shadow-sm"; // Active state style
    const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    const logoutButtonClasses = "w-full text-red-600 hover:!bg-red-50 hover:!text-red-700"; // Specific logout style overrides

    // Function to determine NavLink classes based on active state
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

    const handleLogoutClick = () => {
         if (window.confirm('Are you sure you want to logout from the admin panel?')) {
             logout();
         }
    };

    return (
        <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col border-r border-gray-200 h-full"> {/* Ensure full height */}
            {/* Logo/Brand */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4 flex-shrink-0"> {/* Fixed height */}
                <Link to="/admin/dashboard" className="text-xl lg:text-2xl font-bold font-poppins text-primary whitespace-nowrap hover:opacity-80 transition-opacity">
                    HOMYSA Admin
                </Link>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar"> {/* Added custom-scrollbar if defined */}
                <NavLink to="/admin/dashboard" end className={getNavLinkClass}>
                    <LayoutDashboard size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors" />
                    Dashboard
                </NavLink>
                <NavLink to="/admin/products" className={getNavLinkClass}>
                    <Package size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors" />
                    Products
                </NavLink>
                 <NavLink to="/admin/orders" className={getNavLinkClass}>
                    <ShoppingCart size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors" />
                    Orders
                </NavLink>
                 <NavLink to="/admin/custom-orders" className={getNavLinkClass}>
                     {/* Consider a different icon if MessageSquare is used for Contacts */}
                    <MessageSquare size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors" />
                    Custom Orders
                </NavLink>
                 <NavLink to="/admin/users" className={getNavLinkClass}>
                    <Users size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors" />
                    Users
                </NavLink>
                 <NavLink to="/admin/contacts" className={getNavLinkClass}>
                    <Mail size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors" />
                    Contacts
                </NavLink>
                {/* --- Example: Settings Link --- */}
                {/* <NavLink to="/admin/settings" className={getNavLinkClass}>
                    <Settings size={18} className="mr-3 flex-shrink-0 group-[.active]:text-white text-gray-400 group-hover:text-primary transition-colors"/>
                    Settings
                </NavLink> */}
                 {/* --- End Example --- */}
            </nav>

             {/* Footer/Logout - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 mt-auto flex-shrink-0"> {/* Fixed height */}
                 <button
                    onClick={handleLogoutClick}
                    className={`${baseLinkClasses} ${logoutButtonClasses}`} // Apply base and logout-specific classes
                 >
                    <LogOut size={18} className="mr-3 flex-shrink-0" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;