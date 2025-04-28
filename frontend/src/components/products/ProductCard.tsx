// frontend/src/components/products/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';

// Interface for the product data this card expects
// Should align with the data structure fetched from your API
interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    images: { url: string }[]; // Expecting at least one image with a url
    ratings?: number; // Optional average rating
    stock?: number; // Optional stock level
    description?: string; // Optional description for list view
    // Add any other relevant fields displayed on the card
}

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list'; // Default to grid if not provided
}

// Helper function to format currency
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {

    // --- TODO: Implement actual Cart/Wishlist Logic ---
    // Replace console logs with actual state management (context, redux, etc.)
    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Prevent link navigation if button is inside Link
        e.stopPropagation();
        console.log("Add to cart:", product._id);
        alert(`Added ${product.name} to cart (simulation)`);
    };

    const handleAddToWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Add to wishlist:", product._id);
        alert(`Added ${product.name} to wishlist (simulation)`);
    };
    // --- End TODO ---

    const isOutOfStock = product.stock === 0;

    // --- List View Rendering ---
    if (viewMode === 'list') {
        return (
            <motion.div
                layout="position" // Animate position changes
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col sm:flex-row overflow-hidden"
            >
                {/* Image Section */}
                <Link
                    to={`/shop/${product._id}`}
                    className="block sm:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 overflow-hidden aspect-square sm:aspect-[4/3] relative group"
                    aria-label={`View details for ${product.name}`}
                >
                    <img
                        src={product.images[0]?.url || '/placeholder-image.jpg'} // Fallback image
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        loading="lazy"
                    />
                     {isOutOfStock && (
                         <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-semibold px-2 py-0.5 rounded">Out of Stock</div>
                     )}
                </Link>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                    <div>
                        {/* Category & Rating */}
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                            {product.ratings !== undefined && (
                                <div className="flex items-center text-xs text-gray-500" title={`Rating: ${product.ratings.toFixed(1)} out of 5`}>
                                    <Star size={14} className="mr-0.5 text-yellow-400 fill-current"/>
                                    <span>{product.ratings.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        {/* Product Name */}
                        <Link to={`/shop/${product._id}`} className="block mb-2">
                            <h3 className="font-poppins font-medium text-base md:text-lg text-neutral-800 hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {product.name}
                            </h3>
                        </Link>
                        {/* Optional Short Description */}
                         {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {product.description.substring(0, 120)}{product.description.length > 120 ? '...' : ''}
                            </p>
                         )}
                    </div>
                    {/* Price & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
                        <p className="font-poppins font-semibold text-primary text-lg sm:text-xl order-2 sm:order-1">
                            {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 self-start sm:self-center order-1 sm:order-2">
                             <button onClick={handleAddToWishlist} title="Add to Wishlist" className="btn-icon btn-outline-secondary p-1.5 hover:text-red-500 hover:border-red-300 hover:bg-red-50" aria-label="Add to Wishlist">
                                <Heart size={18} />
                            </button>
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="btn-primary btn-sm inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={16} />
                                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // --- Grid View (Default) ---
    return (
       <motion.div
           layout="position" // Animate position changes
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
           className="group flex flex-col h-full" // Ensure card takes full height
       >
           <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100">
                {/* Image Container */}
                <div className="relative overflow-hidden">
                    <Link to={`/shop/${product._id}`} className="block aspect-square" aria-label={`View details for ${product.name}`}>
                       <img
                           src={product.images[0]?.url || '/placeholder-image.jpg'} // Fallback image
                           alt={product.name}
                           className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                           loading="lazy"
                       />
                    </Link>
                     {/* Quick Actions (Wishlist) */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button onClick={handleAddToWishlist} title="Add to Wishlist" className="bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Add to Wishlist">
                           <Heart size={18} />
                       </button>
                       {/* Add Quick View button here if needed */}
                    </div>
                     {/* Add to Cart Button (Overlay) */}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                       <button
                           onClick={handleAddToCart}
                           disabled={isOutOfStock}
                           className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-poppins font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                       >
                           <ShoppingCart size={18} />
                           <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                       </button>
                    </div>
                     {/* Out of Stock Badge */}
                     {isOutOfStock && (
                         <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-semibold px-2 py-0.5 rounded">Out of Stock</div>
                     )}
               </div>
               {/* Content Container */}
               <div className="p-4 flex flex-col flex-grow">
                    {/* Category & Rating */}
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                        {product.ratings !== undefined && (
                            <div className="flex items-center text-xs text-gray-500" title={`Rating: ${product.ratings.toFixed(1)} out of 5`}>
                                <Star size={14} className="mr-0.5 text-yellow-400 fill-current"/>
                               <span>{product.ratings.toFixed(1)}</span>
                           </div>
                        )}
                    </div>
                    {/* Product Name */}
                   <Link to={`/shop/${product._id}`} className="flex-grow block mb-2">
                       <h3 className="font-poppins font-medium text-base text-neutral-800 hover:text-primary transition-colors line-clamp-2 leading-snug">
                           {product.name}
                       </h3>
                   </Link>
                   {/* Price */}
                   <p className="font-poppins font-semibold text-primary text-lg mt-auto pt-1">
                       {formatPrice(product.price)}
                   </p>
               </div>
           </div>
       </motion.div>
    );
};

export default ProductCard;