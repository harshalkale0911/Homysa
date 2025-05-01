// frontend/src/pages/ShopPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Check, X, Loader2, AlertCircle, Grid, List, SlidersHorizontal, Search } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import ProductCard from '../components/products/ProductCard'; // Import the reusable ProductCard

// --- Interfaces ---
interface Product { _id: string; name: string; category: string; price: number; images: { url: string }[]; ratings?: number; stock?: number; description?: string; }
interface Category { _id: string | 'all'; name: string; count?: number }
interface PriceRange { id: string; name: string; min?: number; max?: number; }
interface SortOption { value: string; label: string; }
interface ApiResponse { success: boolean; message?: string; products?: Product[]; count?: number; filteredCount?: number; productsPerPage?: number; totalPages?: number; categories?: Category[]; }

// --- Constants & Data ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const PRODUCTS_PER_PAGE = 9;
// Added "Interior Design Project" to static categories based on previous steps
const staticCategories: Category[] = [ { _id: 'all', name: 'All Categories' }, { _id: 'Tables', name: 'Tables' }, { _id: 'Chairs', name: 'Chairs' }, { _id: 'Storage', name: 'Storage' }, { _id: 'Sets', name: 'Sets' }, { _id: 'Beds', name: 'Beds' }, { _id: 'Decor', name: 'Decor' }, { _id: 'Outdoor', name: 'Outdoor'}, { _id: 'Office', name: 'Office'}, { _id: 'Interior Design Project', name: 'Interior Design'}, { _id: 'Other', name: 'Other'} ];
const priceRanges: PriceRange[] = [ { id: 'all', name: 'All Prices' }, { id: '0-15000', name: 'Under ₹15,000', max: 14999.99 }, { id: '15000-30000', name: '₹15,000 - ₹30,000', min: 15000, max: 30000 }, { id: '30000-50000', name: '₹30,000 - ₹50,000', min: 30000.01, max: 50000 }, { id: '50000-9999999', name: 'Above ₹50,000', min: 50000.01 } ];
const sortOptions: SortOption[] = [ { value: 'featured', label: 'Featured' }, { value: '-createdAt', label: 'Newest' }, { value: 'price', label: 'Price: Low to High' }, { value: '-price', label: 'Price: High to Low' }, { value: '-ratings', label: 'Avg. Rating' } ];

// --- Component ---
const ShopPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State for filters & sorting
    const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
    const [selectedPriceRange, setSelectedPriceRange] = useState<string>(searchParams.get('price') || 'all');
    const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'featured');
    const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get('page')) || 1);
    const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('keyword') || '');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);

    // State for data, loading, errors, pagination
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>(staticCategories);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredCount, setFilteredCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    // UI State
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Debounce effect for search
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedSearchTerm(searchTerm); if (currentPage !== 1) setCurrentPage(1); }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, currentPage]);

    // --- Fetch Products ---
    const fetchProducts = useCallback(async () => {
        setLoading(true); setError(null);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedPriceRange !== 'all') { const range = priceRanges.find(r => r.id === selectedPriceRange); if (range?.min) params.set('price[gte]', range.min.toString()); if (range?.max) params.set('price[lte]', range.max.toString()); }
        if (sortBy !== 'featured') params.set('sort', sortBy);
        if (debouncedSearchTerm) params.set('keyword', debouncedSearchTerm);
        params.set('page', currentPage.toString());
        params.set('limit', PRODUCTS_PER_PAGE.toString());
        setSearchParams(params, { replace: true });

        try {
            // console.log(`Fetching products: ${API_BASE_URL}/products?${params.toString()}`);
            const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
            if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.message || `Fetch error (${response.status})`); }
            const data: ApiResponse = await response.json();
            if (!data.success) throw new Error(data.message || 'API error');
            // console.log("Products fetched:", data.products?.length);
            setProducts(data.products || []); setFilteredCount(data.filteredCount || 0); setTotalPages(Math.ceil((data.filteredCount || 0) / PRODUCTS_PER_PAGE));
        } catch (err: any) { console.error("Fetch Products Error:", err); setError(err.message || 'An error occurred.'); setProducts([]); setFilteredCount(0); setTotalPages(1); }
        finally { setLoading(false); }
    }, [selectedCategory, selectedPriceRange, sortBy, currentPage, debouncedSearchTerm, setSearchParams]);

    useEffect(() => { fetchProducts(); window.scrollTo(0, 0); }, [fetchProducts]);
    // useEffect(() => { /* Fetch categories API */ }, []);

    // --- Event Handlers ---
    const handleFilterChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => { setter(value); setCurrentPage(1); setShowFilters(false); }, []);
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSortBy(e.target.value); setCurrentPage(1); };
    const handlePageChange = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
    const clearFilters = useCallback(() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedPriceRange('all'); setSortBy('featured'); setCurrentPage(1); setShowFilters(false); setSearchParams({}, { replace: true }); }, [setSearchParams]);

    // --- Memoized Filter Sidebar ---
    const filterSidebar = useMemo(() => (
        <div className="lg:w-1/4 xl:w-1/5">
             <div className="sticky top-24 space-y-6">
                <div className={`bg-white p-5 rounded-lg shadow-sm border border-gray-200 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                    {/* Filter Header */}
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                         <h3 className="text-lg font-semibold text-neutral-dark flex items-center gap-2">
                             <SlidersHorizontal size={18} className="text-gray-500"/>
                             Filters
                         </h3>
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:underline"
                            disabled={selectedCategory === 'all' && selectedPriceRange === 'all' && !searchTerm}
                            title="Clear all filters"
                         >
                             Clear All
                        </button>
                    </div>

                    {/* Filter Sections */}
                    <div className="space-y-6">
                        {/* Category Filter */}
                        <div>
                             {/* Category Title */}
                            <h4 className="font-poppins font-semibold text-neutral-dark mb-3 text-base border-b border-gray-100 pb-2">
                                Category
                            </h4>
                            {/* Category List */}
                            <ul className="space-y-1 max-h-60 overflow-y-auto pr-1 text-sm custom-scrollbar">
                                {categories.map(category => (
                                    <li key={category._id}>
                                        <button
                                            onClick={() => handleFilterChange(setSelectedCategory)(category._id.toString())}
                                            className={`flex items-center text-left w-full transition-colors duration-200 rounded group ${ // Removed padding here, added below
                                                selectedCategory === category._id
                                                ? 'text-primary font-medium' // Keep text primary
                                                : 'text-gray-700 hover:text-primary'
                                            }`}
                                            aria-pressed={selectedCategory === category._id}
                                        >
                                            {/* Background and checkmark logic */}
                                            <span className={`w-full flex items-center px-2.5 py-1.5 rounded ${ // Apply padding & bg here
                                                selectedCategory === category._id
                                                ? 'bg-orange-50' // Light tan/beige background for selected
                                                : 'hover:bg-gray-100' // Hover background for unselected
                                            }`}>
                                                 <span className="w-5 mr-1.5 flex-shrink-0 h-4"> {/* Container for icon alignment */}
                                                     {selectedCategory === category._id && <Check size={16} className="text-primary" />}
                                                 </span>
                                                <span>{category.name}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                             </ul>
                        </div>

                        {/* Price Filter */}
                        <div>
                             {/* Price Title */}
                             <h4 className="font-poppins font-semibold text-neutral-dark mb-3 text-base border-b border-gray-100 pb-2">
                                Price
                             </h4>
                            {/* Price List */}
                            <ul className="space-y-1 text-sm">
                                {priceRanges.map(range => (
                                    <li key={range.id}>
                                         <button
                                            onClick={() => handleFilterChange(setSelectedPriceRange)(range.id)}
                                            className={`flex items-center text-left w-full transition-colors duration-200 rounded group ${ // Removed padding here
                                                selectedPriceRange === range.id
                                                ? 'text-primary font-medium' // Keep text primary
                                                : 'text-gray-700 hover:text-primary'
                                            }`}
                                            aria-pressed={selectedPriceRange === range.id}
                                        >
                                             {/* Background and checkmark logic */}
                                            <span className={`w-full flex items-center px-2.5 py-1.5 rounded ${ // Apply padding & bg here
                                                selectedPriceRange === range.id
                                                ? 'bg-orange-50' // Light tan/beige background for selected
                                                : 'hover:bg-gray-100' // Hover background for unselected
                                            }`}>
                                                <span className="w-5 mr-1.5 flex-shrink-0 h-4"> {/* Container for icon alignment */}
                                                    {selectedPriceRange === range.id && <Check size={16} className="text-primary" />}
                                                </span>
                                                <span>{range.name}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         {/* Add More Filters Here */}
                    </div>
                </div>
            </div>
        </div>
    // Dependencies for useMemo
    ), [categories, selectedCategory, selectedPriceRange, searchTerm, showFilters, clearFilters, handleFilterChange]);

    // --- Render ---
    return (
        <PageTransition>
            {/* Hero banner */}
            <div className="relative py-36 px-6 bg-neutral-dark isolate">
                <div className="absolute inset-0 opacity-15 z-[-1]"> <img src="https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Shop Banner Background" className="w-full h-full object-cover" loading="lazy"/> </div>
                <div className="container-custom text-center z-10 relative"> <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4">Our Collection</motion.h1> <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto"> Explore handcrafted furniture, blending timeless design with quality materials. </motion.p> </div>
            </div>

            {/* Shop Layout */}
            <div className="container-custom py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                    {/* Mobile Filter Trigger */}
                     <div className="lg:hidden flex justify-between items-center mb-4 p-3 bg-white rounded-md shadow-sm border">
                         <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-primary font-medium text-sm" aria-expanded={showFilters} aria-controls="filter-panel-mobile"> <Filter size={18} className="mr-2" /> Filters </button>
                         <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-200 text-primary' : 'text-gray-500 hover:bg-gray-100'} rounded-l-md transition-colors`} aria-label="Grid View"><Grid size={18}/></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-200 text-primary' : 'text-gray-500 hover:bg-gray-100'} rounded-r-md border-l border-gray-300 transition-colors`} aria-label="List View"><List size={18}/></button>
                         </div>
                     </div>
                     {/* Filters */}
                      <AnimatePresence>
                          {showFilters && (
                             <motion.div
                                key="mobile-filters" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="lg:hidden mb-6 overflow-hidden" id="filter-panel-mobile"
                             >
                                 {filterSidebar}
                             </motion.div>
                         )}
                      </AnimatePresence>
                      <div className="hidden lg:block">{filterSidebar}</div>

                    {/* Product Grid & Controls */}
                    <div className="lg:w-3/4 xl:w-4/5">
                        {/* Top Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 gap-4">
                             <div className="relative w-full md:w-1/3 order-3 md:order-1">
                                 <label htmlFor="search-products-main" className="sr-only">Search Products</label>
                                 <input type="search" id="search-products-main" placeholder="Search this collection..." value={searchTerm} onChange={handleSearchChange} className="input-field w-full !pl-9 text-sm !py-2" />
                                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>
                             <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start order-2 md:order-2">
                                 <p className="text-sm text-gray-600 flex-shrink-0"> {loading ? 'Loading...' : `${filteredCount} Product${filteredCount !== 1 ? 's' : ''}`} </p>
                                <div className="relative flex-shrink-0">
                                    <label htmlFor="sort-by" className="sr-only">Sort By</label>
                                    <select id="sort-by" value={sortBy} onChange={handleSortChange} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"> {sortOptions.map(option => ( <option key={option.value} value={option.value}>{option.label}</option>))} </select>
                                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                             </div>
                            <div className="hidden sm:flex items-center border border-gray-300 rounded-md order-3">
                                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200 text-primary' : 'text-gray-500 hover:bg-gray-100'} rounded-l-md transition-colors`} aria-label="Grid View"><Grid size={18}/></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-200 text-primary' : 'text-gray-500 hover:bg-gray-100'} rounded-r-md border-l border-gray-300 transition-colors`} aria-label="List View"><List size={18}/></button>
                             </div>
                        </div>

                         {/* Loading / Error / No Results States */}
                         {loading && <div className="flex justify-center items-center py-20 min-h-[300px]"><Loader2 size={40} className="animate-spin text-primary" /></div>}
                         {error && <div className="text-center py-20 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200 min-h-[300px]" role="alert"><AlertCircle size={40} className="mx-auto mb-2"/><p>{error}</p><button onClick={clearFilters} className="mt-4 text-primary hover:underline text-sm">Try clearing filters</button></div>}
                        {!loading && !error && products.length === 0 && <div className="text-center py-20 bg-white rounded-lg shadow border border-gray-200 min-h-[300px] flex flex-col justify-center items-center"><h3 className="text-xl font-semibold mb-2 text-neutral-dark">No Products Found</h3><p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p><button onClick={clearFilters} className="btn-outline text-sm">Clear Filters & Search</button></div>}

                        {/* Products Grid/List */}
                        {!loading && !error && products.length > 0 && (
                             <motion.div layout className={`grid gap-6 md:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                <AnimatePresence>
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} viewMode={viewMode} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && totalPages > 1 && (
                             <div className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 text-gray-600 disabled:cursor-not-allowed transition-colors" aria-label="Previous page"> <ChevronDown className="-rotate-90" size={18} /> </button>
                                { // Basic pagination display
                                    Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                                        <button key={pageNumber} onClick={() => handlePageChange(pageNumber)} disabled={currentPage === pageNumber}
                                            className={`w-8 h-8 sm:w-9 sm:h-9 border rounded-md text-sm transition-colors ${currentPage === pageNumber ? 'bg-primary text-white border-primary font-semibold' : 'text-gray-600 hover:bg-gray-100' }`}
                                            aria-label={`Go to page ${pageNumber}`} aria-current={currentPage === pageNumber ? 'page' : undefined} >
                                            {pageNumber}
                                        </button>
                                    ))
                                }
                                 <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 text-gray-600 disabled:cursor-not-allowed transition-colors" aria-label="Next page"> <ChevronDown className="rotate-90" size={18} /> </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ShopPage;