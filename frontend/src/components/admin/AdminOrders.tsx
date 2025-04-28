// frontend/src/components/admin/AdminOrders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Trash2, Loader2, AlertCircle, IndianRupee, CheckCircle, RefreshCw } from 'lucide-react'; // Added icons

const API_BASE_URL = import.meta.env.VITE_API_ADMIN_BASE_URL || 'http://localhost:5000/api/v1/admin'; // Use env var

// --- Interfaces ---
interface AdminOrderItem { _id?: string; name: string; quantity: number; price: number; product: string; }
interface AdminUserRef { _id: string; name?: string; email: string; } // Simplified user ref
interface AdminOrder {
    _id: string;
    user: AdminUserRef;
    orderItems: AdminOrderItem[];
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
    paidAt?: string;
    deliveredAt?: string;
    // Add updatedAt if available from backend
    updatedAt?: string;
}

// --- Helper Functions --- (Move to utils eventually)
const formatPrice = (price: number): string => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
const formatDate = (dateString?: string): string => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
const getStatusColorClasses = (status: string): string => {
    // Returns Tailwind classes for background, text, and border
    switch (status?.toLowerCase()) {
        case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'shipped': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
        case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
        case 'payment pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'failed': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};
// Select dropdown styles - combining base and status-specific styles
const getSelectClasses = (status: string): string => {
    const baseClasses = "text-xs font-medium p-1 rounded border focus:outline-none focus:ring-1 focus:ring-primary appearance-none";
    const statusClasses = getStatusColorClasses(status);
    return `${baseClasses} ${statusClasses}`;
};

const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed', 'Payment Pending']; // Possible statuses for dropdown

// --- Component ---
const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({}); // Track loading state per order
    const [deletingOrder, setDeletingOrder] = useState<string | null>(null); // Track deleting state
    // Add state for pagination, filters (status, date range)

    const fetchOrders = useCallback(async () => { // useCallback to prevent re-creation on re-renders
        setLoading(true);
        setError(null);
        try {
             console.log("Fetching admin orders...");
             const response = await fetch(`${API_BASE_URL}/orders`, { // Add pagination/filters later ?page=1&limit=10
                 credentials: 'include' // Send cookies
             });
             if (!response.ok) {
                  const errData = await response.json().catch(() => ({}));
                  throw new Error(errData.message || `Failed to fetch orders (${response.status})`);
             }
             const data = await response.json();
             if (!data.success) {
                 throw new Error(data.message || 'API error fetching orders');
             }
             setOrders(data.orders || []);
             // Set pagination state based on data.count, data.totalPages etc.

        } catch (err: any) {
             setError(err.message || 'Failed to load orders.');
             setOrders([]); // Clear orders on error
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array: fetch only once on mount or when manually triggered

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]); // Run fetchOrders on mount

    const handleUpdateStatus = async (orderId: string, newStatus: string, currentStatus: string) => {
        if (newStatus === currentStatus) return; // No change

        setUpdatingStatus(prev => ({ ...prev, [orderId]: true })); // Set loading state for this specific order
        setError(null); // Clear general error

        try {
            const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || `Failed to update status to ${newStatus}`);
            }

            // Update the order in the local state ONLY AFTER successful API call
            setOrders(prevOrders => prevOrders.map(order =>
                order._id === orderId ? { ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() } : order // Update status and maybe timestamp
            ));
             console.log(`Order ${orderId} status updated to ${newStatus}`);
             // Optionally show a success toast message

        } catch (err: any) {
            console.error(`Update status error for order ${orderId}:`, err);
            setError(`Failed to update status for order ${orderId.substring(0, 8)}...: ${err.message}`);
            // Revert dropdown visually if needed (though state didn't change on error)
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false })); // Clear loading state for this order
        }
    };

    const handleDeleteOrder = async (orderId: string, orderIdentifier: string) => {
        if (!window.confirm(`Are you sure you want to delete order ${orderIdentifier}? This action might be irreversible.`)) return;

        setDeletingOrder(orderId); // Set loading state for deletion
        setError(null);

        try {
             const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
                 method: 'DELETE',
                 credentials: 'include',
             });
             const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to delete order.');
            }

            // Remove the order from local state only on success
            setOrders(prevOrders => prevOrders.filter(o => o._id !== orderId));
            console.log(`Order ${orderId} deleted successfully.`);
            // Optionally show a success toast message

        } catch (err: any) {
            console.error(`Delete order error for ${orderId}:`, err);
            setError(`Failed to delete order ${orderIdentifier}: ${err.message}`);
        } finally {
            setDeletingOrder(null); // Clear loading state
        }
    };


    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold font-poppins text-neutral-dark">Manage Orders</h1>
                 <div className="flex items-center gap-2">
                    {/* Add filters (Status dropdown, Date range picker) here */}
                     {/* Example Refresh Button */}
                     <button onClick={fetchOrders} disabled={loading} className="btn-icon btn-outline-secondary text-sm p-1.5 disabled:opacity-50" title="Refresh Orders">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                 </div>
            </div>

            {/* Global Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 flex items-center gap-2" role="alert">
                    <AlertCircle size={20}/> {error}
                </div>
            )}

            {loading && orders.length === 0 && ( // Show loader only if orders aren't loaded yet
                 <div className="flex justify-center items-center py-10 min-h-[300px]">
                     <Loader2 className="animate-spin text-primary" size={32} />
                 </div>
             )}

            {!loading && orders.length === 0 && !error && ( // Empty state
                 <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
                     <Package size={48} className="mx-auto text-gray-400 mb-4" />
                     <p className="text-gray-500">No orders found.</p>
                     {/* Add filter clearing button if filters are active */}
                 </div>
             )}

            {orders.length > 0 && ( // Render table only if orders exist
                <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Table Headers */}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => {
                                const orderIdentifier = order._id.substring(order._id.length - 6); // Short ID for messages
                                const isUpdating = updatingStatus[order._id];
                                const isDeleting = deletingOrder === order._id;
                                return (
                                    <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={isUpdating || isDeleting ? 'opacity-60 bg-gray-50' : ''}>
                                        {/* Order Data Cells */}
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate" title={order._id}>{orderIdentifier}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                             <div className="text-sm text-gray-800 truncate" title={order.user?.email}>{order.user?.name || order.user?.email || 'N/A'}</div>
                                             <div className="text-xs text-gray-500">{order.user?._id.substring(order.user._id.length - 6)}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500" title={order.createdAt}>{formatDate(order.createdAt)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{formatPrice(order.totalPrice)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {/* Editable Status Dropdown */}
                                             <div className="relative">
                                                 <select
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleUpdateStatus(order._id, e.target.value, order.orderStatus)}
                                                    disabled={isUpdating || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled' || order.orderStatus === 'Failed'} // Disable dropdown while updating or for terminal statuses
                                                    className={`${getSelectClasses(order.orderStatus)} disabled:opacity-70 disabled:cursor-not-allowed`}
                                                    aria-label={`Update status for order ${orderIdentifier}`}
                                                >
                                                    {/* Show current status even if it's terminal */}
                                                    {orderStatuses.includes(order.orderStatus) || <option value={order.orderStatus}>{order.orderStatus}</option>}
                                                     {orderStatuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                                 {isUpdating && <Loader2 size={14} className="absolute right-1 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
                                             </div>
                                        </td>
                                         <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {/* TODO: Link to order detail page */}
                                            {/* <Link to={`/admin/orders/${order._id}`} title="View Details" className={`text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 ${isDeleting || isUpdating ? 'opacity-50 pointer-events-none' : ''}`}><Eye size={16}/></Link> */}
                                             <button
                                                onClick={() => handleDeleteOrder(order._id, orderIdentifier)}
                                                title="Delete Order"
                                                disabled={isDeleting || isUpdating}
                                                className={`text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                aria-label={`Delete order ${orderIdentifier}`}
                                             >
                                                 {isDeleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                                             </button>
                                        </td>
                                    </motion.tr>
                                );
                             })}
                        </tbody>
                    </table>
                    {/* TODO: Add Pagination controls here */}
                 </div>
             )}


        </motion.div>
    );
};

export default AdminOrders;