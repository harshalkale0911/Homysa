// frontend/src/components/account/OrdersSection.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Loader2, AlertCircle, Calendar, Hash, IndianRupee, ChevronRight } from 'lucide-react';

// Interfaces (Align with backend Order model)
interface OrderItem {
    _id?: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    product: string; // Product ID
}

interface ShippingInfo { // Add if needed for display
    address: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    phoneNo: string;
}

interface Order {
    _id: string;
    orderItems: OrderItem[];
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
    shippingInfo?: ShippingInfo; // Optional
    paidAt?: string;
    deliveredAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

// Helper functions (consider moving to a utils file)
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

const getStatusColor = (status: string): string => {
    // Ensure case-insensitivity and handle potential null/undefined
    switch (status?.toLowerCase()) {
        case 'processing': return 'text-blue-700 bg-blue-100 border-blue-200';
        case 'shipped': return 'text-cyan-700 bg-cyan-100 border-cyan-200';
        case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
        case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
        case 'payment pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        case 'failed': return 'text-red-700 bg-red-100 border-red-200';
        default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
};

const OrdersSection: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/orders/me`, {
                    credentials: 'include', // Send cookies for authentication
                });

                if (!response.ok) {
                     if (response.status === 401) {
                         throw new Error('Please log in to view your orders.');
                     }
                     const errorData = await response.json().catch(() => ({})); // Try to parse error
                     throw new Error(errorData.message || `Failed to fetch orders (${response.status})`);
                }

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Could not load orders.');
                }
                setOrders(data.orders || []); // Ensure orders is always an array

            } catch (err: any) {
                console.error("Fetch Orders Error:", err);
                setError(err.message || 'An unexpected error occurred while loading orders.');
                setOrders([]); // Clear orders on error
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []); // Fetch only once on component mount

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center p-10 min-h-[200px]">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            );
        }

        if (error) {
            return (
                 <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-3" role="alert">
                     <AlertCircle className="inline flex-shrink-0" size={20} />
                     <div>
                         <p className="font-medium">Error loading orders:</p>
                         <p>{error}</p>
                     </div>
                 </div>
            );
        }

        if (orders.length === 0) {
            return (
                <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn-primary inline-block text-sm px-6 py-2">Start Shopping</Link>
                </div>
            );
        }

        // Render orders list
        return (
            <div className="space-y-5">
                {orders.map((order) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                        {/* Order Header */}
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className='flex flex-col sm:flex-row sm:items-center sm:gap-4'>
                                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0">
                                        <Hash size={14} className="mr-1 text-gray-400"/> Order ID:
                                        <span className="font-medium text-gray-800 ml-1 break-all select-all" title={order._id}>
                                            {order._id.substring(order._id.length - 8)} {/* Show last 8 chars */}
                                        </span>
                                    </div>
                                     <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                        <Calendar size={14} className="mr-1 text-gray-400"/> Placed:
                                        <span className="font-medium text-gray-800 ml-1">{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>

                         {/* Order Items */}
                         <div className="p-4 sm:p-6 space-y-4">
                            {order.orderItems.map((item) => (
                                 <div key={item.product + (item._id || '')} className="flex items-start sm:items-center space-x-4 text-sm">
                                     <img
                                         src={item.image || '/placeholder-image.jpg'} // Use placeholder if image missing
                                         alt={item.name}
                                         className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                                         loading="lazy"
                                     />
                                    <div className="flex-grow min-w-0"> {/* Added min-w-0 for flex shrink */}
                                         <Link to={`/shop/${item.product}`} className="font-medium text-neutral-dark hover:text-primary line-clamp-2 mb-0.5 break-words">
                                             {item.name}
                                         </Link>
                                         <p className="text-xs text-gray-500">Qty: {item.quantity} &times; {formatPrice(item.price)}</p>
                                    </div>
                                     <p className="font-semibold text-neutral-dark whitespace-nowrap pl-2 text-right">
                                         {formatPrice(item.price * item.quantity)}
                                     </p>
                                 </div>
                            ))}
                         </div>

                        {/* Order Footer */}
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <p className="text-sm text-gray-700">
                                     Total: <span className="font-semibold text-lg text-primary ml-1">{formatPrice(order.totalPrice)}</span>
                                     <span className='ml-1 text-gray-500'>({order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''})</span>
                                </p>
                                {/* TODO: Implement Order Detail Page */}
                                <button
                                     className="text-sm text-primary font-medium hover:underline inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                     disabled // Disable until detail page exists
                                     // onClick={() => navigate(`/account/orders/${order._id}`)}
                                     aria-label={`View details for order ${order._id.substring(order._id.length - 8)}`}
                                >
                                    View Details <ChevronRight size={16} className="ml-1"/>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-semibold mb-6 font-poppins text-neutral-dark">My Orders</h2>
             {renderContent()}
        </motion.div>
    );
};

export default OrdersSection;