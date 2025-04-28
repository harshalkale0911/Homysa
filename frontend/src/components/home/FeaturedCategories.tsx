import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionTitle from '../ui/SectionTitle';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react'; // Import icons

// Define an interface for the category data structure (adjust if API differs)
interface Category {
    _id: string; // Assuming API sends _id
    name: string;
    image: string; // URL for the category image
    // link generation logic might need adjustment based on API data
}

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api/v1';

const FeaturedCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                // --- TODO: Replace with your actual Categories API Endpoint ---
                // Option 1: Fetch dedicated categories endpoint (if you create one)
                // const response = await fetch(`${API_BASE_URL}/categories?featured=true&limit=4`);

                // Option 2: Derive from products (less ideal but possible if no category endpoint)
                // Fetch a few products from each main category to get images/names
                // This example simulates fetching distinct categories from products - NEEDS BACKEND SUPPORT
                 console.warn("FeaturedCategories: Using simulated category fetch. Implement a real API endpoint.");
                 // Replace this simulation with a real API call
                 const tempMock: Category[] = [
                    { _id: 'tables', name: 'Tables', image: 'https://images.pexels.com/photos/2451264/pexels-photo-2451264.jpeg?auto=compress&cs=tinysrgb&w=600' },
                    { _id: 'chairs', name: 'Chairs', image: 'https://images.pexels.com/photos/116910/pexels-photo-116910.jpeg?auto=compress&cs=tinysrgb&w=600' },
                    { _id: 'wooden-work', name: 'Wooden Work', image: 'https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg?auto=compress&cs=tinysrgb&w=600' },
                    { _id: 'interior-design', name: 'Interior Design', image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600' },
                 ];
                 await new Promise(res => setTimeout(res, 300)); // Simulate delay
                 setCategories(tempMock);


                // --- Uncomment and adapt when API is ready ---
                // if (!response.ok) {
                //     throw new Error('Failed to fetch categories');
                // }
                // const data = await response.json();
                // if (!data.success) {
                //     throw new Error(data.message || 'API Error');
                // }
                // // Assuming API returns { success: true, categories: [...] }
                // setCategories(data.categories || []);
                // if (data.categories?.length === 0) {
                //     setError("No featured categories found.");
                // }
            } catch (err: any) {
                console.error("Fetch Categories Error:", err);
                setError(err.message || 'An error occurred while loading categories.');
                setCategories([]); // Clear categories on error
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Generate link based on category name (adjust if needed)
    const getCategoryLink = (categoryName: string): string => {
        if (categoryName === 'Wooden Work') return '/wooden-work';
        if (categoryName === 'Interior Design') return '/interior-design';
        // Default to shop page with category filter
        return `/shop?category=${encodeURIComponent(categoryName)}`;
    };


    return (
        <section className="py-20 bg-secondary-light">
            <div className="container-custom">
                <SectionTitle
                    subtitle="Browse Categories"
                    title="Explore Our Collections"
                />

                {loading && (
                    <div className="flex justify-center items-center py-10">
                         <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                )}
                {error && (
                    <div className="text-center py-10 text-red-600">
                        <AlertCircle size={32} className="mx-auto mb-2"/>
                        <p>Error loading categories: {error}</p>
                    </div>
                )}

                {!loading && !error && categories.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category._id || index} // Use unique ID
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            >
                                <Link to={getCategoryLink(category.name)} className="block relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md">
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={category.image || '/placeholder-image.jpg'} // Fallback image
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-4 md:p-6">
                                        <div>
                                            <h3 className="text-white text-lg md:text-xl font-poppins font-semibold mb-1">
                                                {category.name}
                                            </h3>
                                            <span className="inline-block text-white text-sm pb-1 border-b border-transparent group-hover:border-white transition-all duration-300">
                                                View Collection
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
                 {!loading && !error && categories.length === 0 && (
                    <p className="text-center text-gray-500 py-10">No categories to display.</p>
                 )}
            </div>
        </section>
    );
};

export default FeaturedCategories;