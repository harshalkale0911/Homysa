// frontend/src/components/home/FeaturedProducts.tsx
import React, { useState, useEffect } from 'react'; // Import React
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Loader2, AlertCircle, Star } from 'lucide-react'; // Added Star
import SectionTitle from '../ui/SectionTitle';

// Define interface for Product data (align with backend)
interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    images: { url: string }[];
    ratings?: number; // Optional average rating
    // Add stock if needed for 'Add to Cart' button logic
    stock?: number;
}

// Tab options (Consider fetching these dynamically if they change often)
const tabs = [
    { id: 'all', label: 'All Featured' }, // Changed 'All' label for clarity
    { id: 'Tables', label: 'Tables' },
    { id: 'Chairs', label: 'Chairs' },
    { id: 'Storage', label: 'Storage' },
    { id: 'Sets', label: 'Sets' },
    // Add other relevant categories that might have featured items
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

const FeaturedProducts: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            // Construct API URL based on activeTab and isFeatured=true
            // Use the public /products endpoint with filters
            const params = new URLSearchParams();
            params.set('limit', '8'); // Limit to 8 featured products
            params.set('isFeatured', 'true'); // Filter only featured products
            if (activeTab !== 'all') {
                params.set('category', activeTab);
            }
            // Optionally add sorting, e.g., by rating or date
            // params.set('sort', '-ratings');

            const apiUrl = `${API_BASE_URL}/products?${params.toString()}`;

            try {
                console.log("Fetching featured products from:", apiUrl); // Log API URL
                const response = await fetch(apiUrl);
                if (!response.ok) {
                     const errorData = await response.json().catch(() => ({}));
                     throw new Error(errorData.message || `Failed to fetch products (${response.status})`);
                }
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'API Error fetching products');
                }

                setProducts(data.products || []); // Ensure products is always an array

            } catch (err: any) {
                console.error("Fetch Featured Products Error:", err);
                setError(err.message || 'An error occurred while fetching products.');
                setProducts([]); // Clear products on error
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeTab]); // Re-fetch when activeTab changes

    // --- TODO: Implement Add to Cart, Wishlist, Quick View functionality ---
    const handleAddToCart = (productId: string) => {
        // Connect to cart state/context
        console.log("Add to cart:", productId);
        alert(`Added ${productId} to cart (simulation)`); // Placeholder feedback
    };
    const handleAddToWishlist = (productId: string) => {
        // Connect to wishlist state/context
        console.log("Add to wishlist:", productId);
        alert(`Added ${productId} to wishlist (simulation)`); // Placeholder feedback
    };
    const handleQuickView = (productId: string) => {
         // Open a modal with product details
         console.log("Quick view:", productId);
         alert(`Show quick view for ${productId} (simulation)`); // Placeholder feedback
    };

    return (
        <section className="py-20">
            <div className="container-custom">
                <SectionTitle
                    subtitle="Our Collection"
                    title="Featured Products"
                    className="text-neutral-dark"
                    subtitleClassName="text-primary"
                />

                {/* Filter tabs */}
                <div className="flex flex-wrap justify-center mb-12 gap-2 md:gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 md:px-5 rounded-full font-poppins font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-neutral hover:bg-gray-200'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                 {/* Loading / Error States */}
                 {loading && (
                    <div className="flex justify-center items-center py-10 min-h-[300px]">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                 )}
                {error && !loading && (
                    <div className="text-center py-10 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200" role="alert">
                        <AlertCircle size={32} className="mx-auto mb-2"/>
                        <p className="font-medium">Error loading products:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Products grid */}
                {!loading && !error && products.length > 0 && (
                    <motion.div
                        layout // Animate layout changes smoothly
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product, index) => (
                            <motion.div
                                layout
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }} // Changed from whileInView for initial load
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                // viewport={{ once: true }} // Remove viewport if using layout animation
                                className="group flex flex-col h-full" // Ensure cards take full height in grid row
                            >
                                {/* Card Structure */}
                                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100">
                                    <div className="relative overflow-hidden">
                                        <Link to={`/shop/${product._id}`} className="block aspect-square"> {/* Fixed aspect ratio */}
                                            <img
                                                src={product.images[0]?.url || '/placeholder-image.jpg'}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </Link>
                                        {/* Quick Actions */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => handleAddToWishlist(product._id)} title="Add to Wishlist" className="bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Add to Wishlist"><Heart size={18} /></button>
                                            <button onClick={() => handleQuickView(product._id)} title="Quick View" className="bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Quick View"><Eye size={18} /></button>
                                        </div>
                                        {/* Add to Cart Button */}
                                        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                                            <button
                                                onClick={() => handleAddToCart(product._id)}
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-poppins font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                                aria-label={`Add ${product.name} to cart`}
                                                disabled={product.stock === 0} // Disable if out of stock
                                            >
                                                <ShoppingCart size={18} />
                                                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col flex-grow">
                                         <div className="flex justify-between items-center mb-1">
                                             <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                                              {/* Optional Rating Display */}
                                             {product.ratings !== undefined && (
                                                 <div className="flex items-center text-xs text-gray-500">
                                                     <Star size={14} className="mr-0.5 text-yellow-400 fill-current"/>
                                                     <span>{product.ratings.toFixed(1)}</span>
                                                 </div>
                                             )}
                                         </div>
                                        <Link to={`/shop/${product._id}`} className="flex-grow block mb-2">
                                            <h3 className="font-poppins font-medium text-neutral-800 hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="font-poppins font-semibold text-primary text-lg mt-auto">{formatPrice(product.price)}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                 {!loading && !error && products.length === 0 && (
                    <p className="text-center text-gray-500 py-10">
                        No featured products found{activeTab !== 'all' ? ` in the ${activeTab} category` : ''}.
                    </p>
                 )}

                <div className="text-center mt-16">
                    <Link to="/shop" className="btn-outline px-8 py-3">
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;