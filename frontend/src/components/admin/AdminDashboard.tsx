// frontend/src/components/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, MessageSquare, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from 'lucide-react';
// --- Import Charting Library ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, // X axis
  LinearScale,   // Y axis
  PointElement,  // Data points
  LineElement,   // Line connecting points
  Title,         // Chart title
  Tooltip,       // Hover tooltips
  Legend,        // Legend (optional)
  Filler,        // For area fill under the line
  ChartOptions, // Type for options
  ChartData     // Type for data
} from 'chart.js';

// --- Register Chart.js components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = import.meta.env.VITE_API_ADMIN_BASE_URL || 'http://localhost:5000/api/v1/admin'; // Use env var

// --- Interfaces ---
interface RecentOrder {
    _id: string;
    user: { _id: string; name?: string; email?: string }; // User might not always be populated or have name
    totalPrice: number;
    orderStatus: string; // Use orderStatus from backend
    createdAt: string;
}
interface DashboardStats {
    totalSales: number;
    salesChangePercent?: number; // Optional percentage change
    newOrdersCount: number;
    ordersChangePercent?: number;
    newUsersCount: number;
    usersChangePercent?: number;
    pendingContactsCount: number;
    salesData: { labels: string[]; data: number[] }; // Data for the chart
    recentOrders: RecentOrder[];
}

// --- Chart Options ---
// Define strongly typed options
const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }, // Hide legend
        title: { display: false }, // Hide title (using component title)
        tooltip: { // Customize tooltips
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        // Format as currency
                        label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        x: {
            grid: { display: false }, // Hide X-axis grid lines
             ticks: { color: '#6b7280' } // Gray ticks for X axis
        },
        y: {
            beginAtZero: true, // Start Y axis at 0
            ticks: {
                precision: 0, // No decimal places on Y axis ticks
                color: '#6b7280', // Gray ticks for Y axis
                // Format Y axis ticks as currency (optional)
                // callback: function(value) {
                //     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(Number(value));
                // }
            },
             grid: { color: '#e5e7eb' } // Lighter grid lines for Y axis
        },
    },
    elements: {
        line: {
            tension: 0.4, // Smoother curve
            borderColor: 'hsl(30, 77%, 54%)', // Primary color (Orange)
            borderWidth: 2,
            fill: true, // Enable area fill
            // Gradient fill
            backgroundColor: (context: any) => { // Use Chart.js context for gradient
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null; // Return if chartArea is not available
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, 'hsla(30, 77%, 54%, 0)'); // Transparent at bottom
                gradient.addColorStop(0.5, 'hsla(30, 77%, 54%, 0.15)'); // Semi-transparent middle
                gradient.addColorStop(1, 'hsla(30, 77%, 54%, 0.3)'); // More opaque at top
                return gradient;
            },
        },
        point: {
            radius: 0, // Hide points by default
            hoverRadius: 6, // Show larger points on hover
            backgroundColor: 'hsl(30, 77%, 54%)', // Point color
            borderColor: '#fff', // White border for points
            borderWidth: 2,
        },
    },
    interaction: {
        mode: 'index' as const, // Show tooltip for all datasets at that index
        intersect: false, // Tooltip appears even if not directly hovering over point
    },
};

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                // --- TODO: Replace with actual API call ---
                 console.log("Fetching dashboard stats from:", `${API_BASE_URL}/dashboard-stats`);
                 // const response = await fetch(`${API_BASE_URL}/dashboard-stats`, { credentials: 'include' });
                 // if (!response.ok) {
                 //    const errData = await response.json().catch(() => ({}));
                 //    throw new Error(errData.message || `Failed to load dashboard data (${response.status})`);
                 // }
                 // const data = await response.json();
                 // if (!data.success) throw new Error(data.message || 'API Error loading dashboard stats');
                 // setStats(data.stats);

                 // --- Simulate API call ---
                 await new Promise(res => setTimeout(res, 900)); // Simulate network delay
                 const mockSalesData = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], data: [12, 19, 15, 28, 22, 31, 25].map(v => v * 5000) }; // Sample data
                 setStats({
                     totalSales: 148550, salesChangePercent: 15.2,
                     newOrdersCount: 42, ordersChangePercent: -8.1, // Example negative change
                     newUsersCount: 18, usersChangePercent: 5.5,
                     pendingContactsCount: 3,
                     salesData: mockSalesData,
                     recentOrders: [
                         { _id: 'o1', user: { _id: 'u1', name: 'Priya Sharma', email: 'p@t.co'}, totalPrice: 5999, orderStatus: 'Processing', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
                         { _id: 'o2', user: { _id: 'u2', name: 'Amit Singh', email: 'a@t.co'}, totalPrice: 18500, orderStatus: 'Shipped', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                         { _id: 'o3', user: { _id: 'u3', name: 'Rajesh Kumar', email: 'r@t.co'}, totalPrice: 12499, orderStatus: 'Delivered', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
                         { _id: 'o4', user: { _id: 'u4', name: 'Sunil Patel', email: 's@t.co'}, totalPrice: 35000, orderStatus: 'Processing', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
                     ]
                 });
                 // --- End Simulation ---

            } catch (err: any) {
                console.error("Dashboard Fetch Error:", err);
                setError(err.message || 'Could not load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Card animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
        })
    };

     const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={40} /></div>;
        }
        if (error) {
            return <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-700 flex items-center gap-3" role="alert"><AlertCircle size={20}/> Error: {error}</div>;
        }
        if (!stats) {
            return <div className="p-6 text-gray-500 text-center">No dashboard data available.</div>;
        }

         // Prepare chart data object with strong typing
        const chartData: ChartData<'line'> = {
            labels: stats.salesData.labels,
            datasets: [{
                label: 'Sales (INR)',
                data: stats.salesData.data,
                // Other dataset properties are defined in lineChartOptions.elements.line
            }],
        };

        return (
            <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    {[
                        { title: 'Total Sales', value: formatPrice(stats.totalSales), percent: stats.salesChangePercent, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
                        { title: 'New Orders', value: stats.newOrdersCount.toString(), percent: stats.ordersChangePercent, icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100' },
                        { title: 'New Users', value: stats.newUsersCount.toString(), percent: stats.usersChangePercent, icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
                        { title: 'Pending Contacts', value: stats.pendingContactsCount.toString(), icon: MessageSquare, color: 'text-orange-600', bgColor: 'bg-orange-100', link: '/admin/contacts?status=New' }, // Example link
                    ].map((item, index) => (
                        <motion.div
                            key={item.title} custom={index} variants={cardVariants} initial="hidden" animate="visible"
                            className="bg-white p-5 rounded-lg shadow border border-gray-100 flex items-start justify-between" // Increased padding
                        >
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{item.title}</p>
                                <p className="text-2xl md:text-3xl font-bold text-neutral-dark">{item.value}</p>
                                {item.percent !== undefined && (
                                    <p className={`text-xs flex items-center mt-1 ${item.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.percent >= 0 ? <ArrowUpRight size={14} className="mr-0.5"/> : <ArrowDownRight size={14} className="mr-0.5"/>}
                                        {Math.abs(item.percent)}% <span className='ml-1 text-gray-500 font-normal hidden sm:inline'>vs prev. period</span>
                                    </p>
                                )}
                            </div>
                             <div className={`p-2.5 rounded-full ${item.bgColor}`}> {/* Adjusted padding */}
                                <item.icon size={20} className={item.color} /> {/* Adjusted size */}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Chart */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                         className="lg:col-span-2 bg-white p-5 rounded-lg shadow border border-gray-100">
                         <h2 className="text-lg font-semibold text-neutral-dark mb-4">Sales Overview (Last 7 Weeks)</h2>
                         <div className="h-80 md:h-96"> {/* Adjusted height */}
                            <Line options={lineChartOptions} data={chartData} />
                         </div>
                    </motion.div>

                     {/* Recent Orders */}
                     <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col">
                        <h2 className="text-lg font-semibold text-neutral-dark mb-4">Recent Orders</h2>
                         {/* Scrollable container for orders */}
                         <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
                             {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                                <Link
                                    to={`/admin/orders`} // Link to the orders list page for now
                                    // TODO: Update link to `/admin/orders/${order._id}` when detail page exists
                                    key={order._id}
                                    className="block p-3 hover:bg-gray-50 rounded-md transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="min-w-0 pr-2"> {/* Prevent text overflow */}
                                            <p className="font-medium text-neutral-dark truncate">{order.user?.name || order.user?.email || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className='text-right flex-shrink-0'>
                                            <p className="font-semibold text-neutral-dark">{formatPrice(order.totalPrice)}</p>
                                            <p className={`text-xs font-medium px-1.5 py-0.5 rounded border ${getStatusColor(order.orderStatus)} inline-block mt-0.5`}>{order.orderStatus}</p>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-10">No recent orders found.</p>
                            )}
                         </div>
                         {stats.recentOrders.length > 0 && (
                             <Link to="/admin/orders" className="text-sm text-primary hover:underline mt-4 pt-3 border-t border-gray-100 block text-center font-medium">
                                View All Orders
                             </Link>
                         )}
                    </motion.div>
                </div>
            </>
        );
     }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl md:text-3xl font-semibold font-poppins text-neutral-dark mb-6">Dashboard</h1>
            {renderContent()}
        </motion.div>
    );
};

export default AdminDashboard;

// Helper functions (consider moving to utils)
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};
const formatDate = (dateString?: string): string => {
     if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return 'Invalid Date';
    }
};
const getStatusColor = (status: string): string => {
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