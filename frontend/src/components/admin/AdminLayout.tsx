// frontend/src/components/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout: React.FC = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Static Sidebar for large screens */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <AdminSidebar />
            </div>

             {/* Mobile Sidebar (Drawer - needs transition logic) */}
             {isMobileSidebarOpen && (
                 <div className="fixed inset-0 z-50 flex lg:hidden">
                     {/* Sidebar Component */}
                     <div className="w-64 bg-white shadow-lg border-r border-gray-200">
                        <AdminSidebar />
                     </div>
                     {/* Overlay to close sidebar */}
                     <div className="flex-1 bg-black bg-opacity-50" onClick={toggleMobileSidebar}></div>
                 </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Pass toggle function */}
                <AdminHeader onToggleMobileSidebar={toggleMobileSidebar} />

                {/* Page Content - Scrollable */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
                    {/* Nested route components will render here */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;