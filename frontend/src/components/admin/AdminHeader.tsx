// frontend/src/components/admin/AdminHeader.tsx
import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // For potential links

// --- TODO: Replace with actual Auth Context/State ---
// Example hook (replace with your actual implementation)
const useAdminAuth = () => {
    const [user, setUser] = useState<{ name?: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate fetching admin user data
        // Replace with actual API call to /api/v1/me or context value
        const fetchAdminUser = async () => {
             try {
                // const response = await fetch('/api/v1/me', { credentials: 'include' });
                // if (response.ok) {
                //     const data = await response.json();
                //     if (data.success && data.user && data.user.role === 'admin') {
                //         setUser(data.user);
                //     } else {
                //          // Redirect if not admin or not logged in
                //          // navigate('/auth');
                //     }
                // } else {
                //     // navigate('/auth');
                // }
                // Simulation:
                await new Promise(res => setTimeout(res, 200));
                setUser({ name: "Admin User" }); // Placeholder
             } catch (error) {
                 console.error("Failed to fetch admin user:", error);
                 // navigate('/auth');
             }
        };
        fetchAdminUser();
    }, []); // Fetch on mount

    const logout = async () => {
         console.log("Admin Logout Triggered (Simulation)");
         // await fetch('/api/v1/logout', { method: 'GET', credentials: 'include' });
         setUser(null);
         navigate('/auth'); // Redirect to login after logout
    };

    return { user, logout };
};
// --- End Auth Context/State Placeholder ---


interface AdminHeaderProps {
    // Add prop for mobile sidebar toggle if needed
    onToggleMobileSidebar?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAdminAuth(); // Get user data and logout

  const handleLogoutClick = () => {
     if (window.confirm('Are you sure you want to logout?')) {
         logout();
     }
  };

  return (
    // Ensure header height is consistent (e.g., h-16)
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-40">
       {/* Left side: Mobile Toggle (only shown on mobile) */}
       <button
            onClick={onToggleMobileSidebar} // Use prop for toggle function
            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary mr-4 p-1" // Added padding
            aria-label="Open sidebar"
        >
            <Menu size={24} />
        </button>

        {/* Spacer to push right items */}
        <div className="flex-grow"></div>

        {/* Right side items */}
      <div className="flex items-center space-x-4 md:space-x-5">
        {/* Notification Icon (Example) */}
        <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <span className="sr-only">View notifications</span>
          <Bell size={20} />
          {/* Example Notification Badge - Conditionally render based on notification count */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span> */}
        </button>

        {/* User Menu (Dropdown can be added later) */}
        <div className="flex items-center space-x-2">
           {/* Placeholder Icon or User Avatar */}
           {/* <img src={user?.avatar?.url || '/default-admin-avatar.png'} alt="Admin Avatar" className="w-8 h-8 rounded-full object-cover" /> */}
           <UserCircle size={28} className="text-gray-400" />
           {/* Display Admin Name */}
           <span className="text-sm font-medium text-gray-700 hidden md:block">
               {user?.name || 'Admin'}
           </span>
           {/* Logout Button (optional here or in a dropdown) */}
           <button onClick={handleLogoutClick} title="Logout" className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-1">
                <LogOut size={18}/>
           </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;