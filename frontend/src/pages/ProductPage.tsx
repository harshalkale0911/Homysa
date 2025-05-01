// frontend/src/pages/ProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Truck, Clock, Shield, ChevronRight, Star, Heart, Loader2, AlertCircle, Maximize, X } from 'lucide-react'; // Added X for modal close
import PageTransition from '../components/ui/PageTransition';
import ProductReviewSection from '../components/products/ProductReviewSection'; // Import review section
import ProductCard from '../components/products/ProductCard'; // Import product card for related items

// --- Interfaces ---
interface ProductImage { public_id: string; url: string; _id?: string; }
// Interface for Review data expected by ProductReviewSection
interface ReviewUser { _id: string; name: string; avatar?: { url: string }; }
interface ProductReview { _id: string; user: ReviewUser; rating: number; comment: string; createdAt: string; }
// Interface for the main Product
interface Product {
    _id: string; name: string; category: string; price: number; description: string; dimensions?: string; material?: string; images: ProductImage[]; colors?: string[]; stock: number; ratings: number; numOfReviews: number; reviews: ProductReview[]; // Include reviews array
    relatedProducts?: ProductSummary[]; // Related products data
}
// Simplified interface for related products, matching ProductCard props
interface ProductSummary {
    _id: string; name: string; price: number; images: { url: string }[]; category: string; ratings?: number; stock?: number; description?: string;
}

// --- API URL ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// --- Helper ---
const formatPrice = (price: number): string => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

// --- Component ---
const ProductPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // --- Fetch Product Data ---
    useEffect(() => {
        const fetchProductAndRelated = async () => {
            if (!productId) { setError("Product ID is missing."); setLoading(false); return; }
            setLoading(true); setError(null); setProduct(null); setRelatedProducts([]); setActiveImageIndex(0); setQuantity(1);

            try {
                console.log(`[ProductPage] Fetching product: ${productId}`);
                const productResponse = await fetch(`${API_BASE_URL}/product/${productId}`);
                if (!productResponse.ok) {
                    if (productResponse.status === 404) throw new Error('Product not found');
                    const errData = await productResponse.json().catch(() => ({}));
                    throw new Error(errData.message || `Failed to fetch product (${productResponse.status})`);
                }
                const productData = await productResponse.json();
                if (!productData.success || !productData.product) {
                    throw new Error(productData.message || 'Failed to load product data');
                }
                const fetchedProduct: Product = productData.product;
                console.log("[ProductPage] Product data received:", fetchedProduct);
                setProduct(fetchedProduct);
                setSelectedColor(fetchedProduct.colors?.[0] || null);

                // Use related products attached by backend if available
                if (fetchedProduct.relatedProducts && fetchedProduct.relatedProducts.length > 0) {
                     console.log("[ProductPage] Using related products from main product fetch.");
                    setRelatedProducts(fetchedProduct.relatedProducts);
                }
                 // Fallback: Fetch related products separately if not attached
                else if (fetchedProduct.category) {
                     console.log(`[ProductPage] Fetching related products separately for category: ${fetchedProduct.category}`);
                     const relatedResponse = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(fetchedProduct.category)}&limit=4&exclude=${productId}`);
                     if (relatedResponse.ok) {
                         const relatedData = await relatedResponse.json();
                         if (relatedData.success) {
                             setRelatedProducts(relatedData.products || []);
                             console.log(`[ProductPage] Found ${relatedData.products?.length || 0} related products.`);
                         } else {
                             console.warn("[ProductPage] Related products API call succeeded but returned no data.");
                         }
                     } else {
                          console.warn(`[ProductPage] Could not fetch related products (${relatedResponse.status})`);
                     }
                }

            } catch (err: any) {
                console.error("[ProductPage] Fetch product error:", err);
                setError(err.message || 'An error occurred while loading the product.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndRelated();
        window.scrollTo(0, 0); // Scroll to top when product changes
    }, [productId]);

    // --- Event Handlers ---
    const handleQuantityChange = (amount: number) => {
        if (!product) return;
        setQuantity(prev => Math.max(1, Math.min(prev + amount, product.stock ?? 1)));
    };
    const handleAddToCart = () => {
         if (!product) return;
         // TODO: Implement Add to Cart logic (dispatch action, update context)
         console.log(`TODO: Add to cart: ${product.name}, ID: ${product._id}, Qty: ${quantity}, Color: ${selectedColor || 'N/A'}`);
         alert(`Added ${quantity} x ${product.name} to cart (simulation)`);
    };
    const handleAddToWishlist = () => {
         if (!product) return;
         // TODO: Implement Add to Wishlist logic
         console.log(`TODO: Add to wishlist: ${product.name}, ID: ${product._id}`);
         alert(`Added ${product.name} to wishlist (simulation)`);
    };
    const openImageModal = (index: number) => { setActiveImageIndex(index); setIsImageModalOpen(true); };
    const closeImageModal = () => setIsImageModalOpen(false);
    const nextImageModal = () => { if (product && product.images.length > 0) setActiveImageIndex((prev) => (prev + 1) % product.images.length); };
    const prevImageModal = () => { if (product && product.images.length > 0) setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length); };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjust height */}
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
         return (
             <div className="container-custom py-20 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                 <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                 <h2 className="text-2xl font-poppins font-semibold text-red-700 mb-4">Error Loading Product</h2>
                 <p className="mb-6 text-gray-600">{error}</p>
                 <button onClick={() => navigate('/shop')} className="btn-primary">
                     Return to Shop
                 </button>
             </div>
         );
     }

    if (!product) {
         return (
             <div className="container-custom py-20 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                 <h2 className="text-2xl font-poppins font-semibold mb-4">Product Not Found</h2>
                 <p className="mb-6 text-gray-500">The product you are looking for might have been removed or is unavailable.</p>
                 <Link to="/shop" className="btn-primary">Return to Shop</Link>
             </div>
         );
     }

    // Derived state after product is loaded
    const isOutOfStock = product.stock === 0;
    const availabilityText = isOutOfStock ? 'Out of Stock' : 'In Stock';
    const availabilityColor = isOutOfStock ? 'text-red-600' : 'text-green-600';

    return (
        <PageTransition>
            {/* Breadcrumb */}
            <div className="bg-gray-100 py-3 border-b border-gray-200">
                <div className="container-custom">
                    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-600">
                        <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={14} className="inline mx-1 text-gray-400"/>
                        <Link to="/shop" className="hover:text-primary">Shop</Link> <ChevronRight size={14} className="inline mx-1 text-gray-400"/>
                        <Link to={`/shop?category=${product.category}`} className="hover:text-primary">{product.category}</Link> <ChevronRight size={14} className="inline mx-1 text-gray-400"/>
                        <span className="font-medium text-gray-800 line-clamp-1" aria-current="page">{product.name}</span> {/* Added line-clamp */}
                    </nav>
                </div>
            </div>

            {/* Product details section */}
            <section className="py-12 md:py-16">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 xl:gap-16">
                        {/* Product Images Column */}
                        <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="flex flex-col-reverse md:flex-row md:gap-4">
                             {/* Thumbnail Images */}
                             {product.images && product.images.length > 1 && (
                                <div className="flex md:flex-col gap-3 mt-4 md:mt-0 md:max-h-[500px] lg:max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
                                    {product.images.map((image, index) => (
                                        <button key={image.public_id || index} onClick={() => setActiveImageIndex(index)}
                                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/50 flex-shrink-0 ${activeImageIndex === index ? 'border-primary shadow-sm scale-105' : 'border-gray-200 hover:border-gray-400' }`}
                                            aria-label={`View image ${index + 1}`}>
                                            <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" loading="lazy"/>
                                        </button>
                                    ))}
                                </div>
                             )}
                             {/* Main Image */}
                            <div className="mb-4 md:mb-0 rounded-lg overflow-hidden shadow-md aspect-square relative flex-grow cursor-pointer group" onClick={() => openImageModal(activeImageIndex)}>
                                 <AnimatePresence mode="wait">
                                     <motion.img
                                         key={activeImageIndex}
                                         src={product.images[activeImageIndex]?.url || '/placeholder-image.jpg'}
                                         alt={product.name}
                                         initial={{ opacity: 0 }}
                                         animate={{ opacity: 1 }}
                                         exit={{ opacity: 0 }}
                                         transition={{ duration: 0.3 }}
                                         className="w-full h-full object-cover"
                                     />
                                 </AnimatePresence>
                                <div className="absolute top-3 right-3 bg-black/40 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="View larger image">
                                     <Maximize size={18} />
                                 </div>
                            </div>
                        </motion.div>

                        {/* Product Info Column */}
                        <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.1}}>
                             <div className="flex justify-between items-start mb-2">
                                <Link to={`/shop?category=${product.category}`} className="text-sm text-gray-500 uppercase tracking-wide hover:text-primary">{product.category}</Link>
                                <button onClick={handleAddToWishlist} title="Add to Wishlist" className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1" aria-label="Add to Wishlist"> <Heart size={20} /> </button>
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-semibold text-neutral-dark mt-1 mb-3 leading-tight">{product.name}</h1>
                             <div className="flex items-center mb-4 space-x-3">
                                {product.ratings > 0 && (
                                    <div className="flex items-center" title={`${product.ratings.toFixed(1)} out of 5 stars`}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} size={16} className={`mr-0.5 ${i < Math.round(product.ratings) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                )}
                                <a href="#reviews" className="text-sm text-gray-600 hover:text-primary hover:underline">({product.numOfReviews} Review{product.numOfReviews !== 1 ? 's' : ''})</a>
                            </div>
                            <p className="text-3xl font-poppins font-semibold text-primary mb-5"> {formatPrice(product.price)} </p>
                            {/* Use Tailwind Prose for description formatting */}
                            <div className="prose prose-sm max-w-none text-gray-700 mb-6 leading-relaxed">{product.description}</div>

                            {/* Options & Actions */}
                            <div className="space-y-6">
                                {/* Color Selection */}
                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-poppins font-medium text-neutral-dark mb-2">Color: <span className="font-semibold">{selectedColor || 'Default'}</span></h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color} onClick={() => setSelectedColor(color)} title={`Select color ${color}`} aria-pressed={selectedColor === color}
                                                    className={`px-4 py-1.5 border text-xs rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 capitalize ${selectedColor === color ? 'border-primary text-primary bg-primary/10 ring-primary/50' : 'border-gray-300 text-gray-600 hover:border-gray-500' }`} >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector & Stock */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                     <div>
                                        <h3 className="text-sm font-poppins font-medium text-neutral-dark mb-2">Quantity</h3>
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1 || isOutOfStock} className="p-2.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md transition-colors" aria-label="Decrease quantity"><Minus size={16} /></button>
                                            <span className="w-12 text-center font-medium px-2 select-none">{quantity}</span>
                                            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock || isOutOfStock} className="p-2.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md transition-colors" aria-label="Increase quantity"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                     <p className={`mt-2 sm:mt-8 text-sm font-semibold ${availabilityColor}`}>
                                        {availabilityText} {product.stock > 0 && product.stock <= 5 && `(Only ${product.stock} left!)`}
                                    </p>
                                </div>

                                {/* Add to Cart Button */}
                                <button onClick={handleAddToCart} disabled={isOutOfStock} className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"> <ShoppingCart size={18} /> <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span> </button>

                                {/* Product Metadata */}
                                <div className="border-t border-gray-200 pt-5 space-y-3 text-sm">
                                    {product.material && ( <div className="flex"><span className="w-28 font-medium text-gray-600 flex-shrink-0">Material:</span> <span className="text-gray-800">{product.material}</span></div> )}
                                    {product.dimensions && ( <div className="flex"><span className="w-28 font-medium text-gray-600 flex-shrink-0">Dimensions:</span> <span className="text-gray-800">{product.dimensions}</span></div> )}
                                    <div className="flex"><span className="w-28 font-medium text-gray-600 flex-shrink-0">SKU:</span> <span className="text-gray-800 uppercase">{product._id.substring(product._id.length - 8)}</span></div>
                                </div>

                                {/* Shipping/Warranty Info Box */}
                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-md space-y-3 text-sm">
                                    <div className="flex items-center"><Truck size={16} className="text-primary mr-2.5 flex-shrink-0" /> <span>Free shipping on orders over ₹20,000</span></div>
                                    <div className="flex items-center"><Clock size={16} className="text-primary mr-2.5 flex-shrink-0" /> <span>Estimated Delivery: 7-12 working days</span></div>
                                    <div className="flex items-center"><Shield size={16} className="text-primary mr-2.5 flex-shrink-0" /> <span>5-Year Limited Warranty Included</span></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Product Details Tabs (Example: Reviews) */}
             <section id="reviews" className="py-12 md:py-16 border-t border-gray-200 bg-white">
                 <div className="container-custom">
                     <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-neutral-dark mb-8">Customer Reviews ({product.numOfReviews})</h2>
                      {/* Pass reviews data to the dedicated component */}
                     <ProductReviewSection productId={product._id} initialReviews={product.reviews || []} productName={product.name} />
                 </div>
             </section>

            {/* Related products section */}
            {relatedProducts.length > 0 && (
                 <section className="py-16 bg-gray-50 border-t border-gray-200">
                    <div className="container-custom">
                        <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-neutral-dark mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {/* Use ProductCard component */}
                             {relatedProducts.map((related) => (
                                <ProductCard key={related._id} product={related as Product} viewMode="grid" />
                            ))}
                        </div>
                    </div>
                </section>
             )}

            {/* Image Lightbox Modal */}
            <AnimatePresence>
                 {isImageModalOpen && product && ( // Ensure product is not null
                     <motion.div
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                         onClick={closeImageModal}
                     >
                         <motion.div
                             initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                             className="relative max-w-4xl max-h-[90vh] w-full bg-black rounded-lg overflow-hidden shadow-2xl"
                             onClick={(e) => e.stopPropagation()}
                         >
                             {/* Close Button */}
                             <button className="absolute top-3 right-3 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-white" onClick={closeImageModal} aria-label="Close image viewer"> <X size={24} /> </button>
                             {/* Image Navigation */}
                             {product.images.length > 1 && (
                                <>
                                 <button onClick={prevImageModal} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Previous image"> <ChevronRight className="rotate-180" size={28}/> </button>
                                 <button onClick={nextImageModal} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Next image"> <ChevronRight size={28}/> </button>
                                </>
                             )}
                             {/* Image Display */}
                              <AnimatePresence mode="wait">
                                 <motion.img
                                     key={activeImageIndex} // Key for animation trigger
                                     src={product.images[activeImageIndex]?.url}
                                     alt={`${product.name} - Image ${activeImageIndex + 1}`}
                                     initial={{ opacity: 0 }}
                                     animate={{ opacity: 1 }}
                                     exit={{ opacity: 0 }}
                                     transition={{ duration: 0.2 }}
                                     className="block max-h-[90vh] w-full h-auto object-contain" // Contain within viewport
                                 />
                             </AnimatePresence>
                         </motion.div>
                     </motion.div>
                 )}
            </AnimatePresence>

        </PageTransition>
    );
};

export default ProductPage;