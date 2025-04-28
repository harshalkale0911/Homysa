// frontend/src/components/admin/AdminProducts.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // For Add/Edit links
import { Package, Edit, Trash2, Loader2, AlertCircle, PlusCircle, IndianRupee, CheckCircle, XCircle, RefreshCw } from 'lucide-react'; // Added icons

const API_BASE_URL = import.meta.env.VITE_API_ADMIN_BASE_URL || 'http://localhost:5000/api/v1/admin'; // Use env var

// Interface for Product data (Align with backend)
interface AdminProduct {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    images: { url: string; public_id?: string }[]; // Include public_id if needed
    ratings?: number; // Average rating
    numOfReviews?: number;
    isFeatured?: boolean;
    createdAt?: string;
}

// Helper functions (move to utils)
const formatPrice = (price: number): string => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
const formatDate = (dateString?: string): string => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';


const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<string | null>(null); // Track deletion state
    // Add state for pagination, search, filters

     const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
             // TODO: Replace with API Call + Filters/Pagination
             console.log("Fetching admin products...");
             const response = await fetch(`${API_BASE_URL}/products`, { // Assuming /admin/products route exists and gives all products
                 credentials: 'include'
             });
             if (!response.ok) {
                  const errData = await response.json().catch(() => ({}));
                  throw new Error(errData.message || `Failed to fetch products (${response.status})`);
             }
             const data = await response.json();
             if (!data.success) throw new Error(data.message || 'API error fetching products');
             setProducts(data.products || []); // Assuming backend sends products array
             // Set pagination state if applicable

        } catch (err: any) {
             setError(err.message || 'Failed to load products.');
             setProducts([]); // Clear on error
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array for now

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDeleteProduct = async (productId: string, productName: string) => {
        // Confirmation dialog before deleting
        if (!window.confirm(`Are you ABSOLUTELY SURE you want to delete the product "${productName}"?\nThis action cannot be undone and will remove it from the store.`)) {
            return;
        }

        setDeletingProduct(productId); // Set loading state for this specific product
        setError(null);

        try {
             const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
                 method: 'DELETE',
                 credentials: 'include',
             });
             const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to delete product.');
            }

            // Remove the product from local state ONLY on success
            setProducts(prev => prev.filter(p => p._id !== productId));
            console.log(`Product ${productName} (${productId}) deleted successfully.`);
            // Optionally show a success toast message

        } catch (err: any) {
            console.error(`Delete product error for ${productId}:`, err);
            setError(`Failed to delete product "${productName}": ${err.message}`);
        } finally {
             setDeletingProduct(null); // Clear loading state
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold font-poppins text-neutral-dark">Manage Products</h1>
                 <div className="flex items-center gap-2">
                    {/* TODO: Link to /admin/products/new or implement modal */}
                     <button className="btn-primary text-sm inline-flex items-center gap-1.5 px-3 py-1.5" disabled>
                        <PlusCircle size={16}/> Add New Product
                     </button>
                      {/* Refresh Button */}
                     <button onClick={fetchProducts} disabled={loading} className="btn-icon btn-outline-secondary text-sm p-1.5 disabled:opacity-50" title="Refresh Products">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                 </div>
                 {/* Add search/filter controls here later */}
            </div>

             {/* Global Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 flex items-center gap-2" role="alert">
                    <AlertCircle size={20}/> {error}
                </div>
             )}

            {loading && products.length === 0 && ( // Initial loading state
                 <div className="flex justify-center items-center py-10 min-h-[300px]">
                     <Loader2 className="animate-spin text-primary" size={32} />
                 </div>
             )}

             {!loading && products.length === 0 && !error && ( // Empty state
                 <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
                     <Package size={48} className="mx-auto text-gray-400 mb-4" />
                     <p className="text-gray-500">No products found.</p>
                     {/* Optionally add link to create product */}
                 </div>
             )}

            {products.length > 0 && ( // Render table only if products exist
                <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Table Headers */}
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th> */}
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => {
                                const isDeleting = deletingProduct === product._id;
                                return (
                                    <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={isDeleting ? 'opacity-50 bg-red-50' : ''}>
                                        {/* Product Data Cells */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <img
                                                src={product.images[0]?.url || 'https://via.placeholder.com/60/EEE/DDD?text=N/A'}
                                                alt={product.name}
                                                className="h-10 w-10 rounded object-cover border bg-gray-100"
                                                loading="lazy"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Link to={`/shop/${product._id}`} target="_blank" title={`View ${product.name} on site`} className="text-sm font-medium text-gray-900 hover:text-primary truncate block max-w-xs">
                                                {product.name}
                                            </Link>
                                             <div className="text-xs text-gray-500">{formatDate(product.createdAt)}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{formatPrice(product.price)}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${product.stock > 0 ? (product.stock <= 5 ? 'text-orange-600' : 'text-green-600') : 'text-red-600'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                        </td>
                                        {/* Featured Status (Example) */}
                                        {/* <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {product.isFeatured ? <CheckCircle size={18} className="text-green-500"/> : <XCircle size={18} className="text-gray-400"/>}
                                        </td> */}
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {/* TODO: Link to edit page or implement edit modal */}
                                            <button title="Edit Product" disabled={isDeleting} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Edit size={16}/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id, product.name)}
                                                title="Delete Product"
                                                disabled={isDeleting}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label={`Delete product ${product.name}`}
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

export default AdminProducts;