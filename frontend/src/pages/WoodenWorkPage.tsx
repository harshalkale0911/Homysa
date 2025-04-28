// frontend/src/pages/WoodenWorkPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, X, Check, PenTool, Leaf, Users, Loader2, AlertCircle } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import SectionTitle from '../components/ui/SectionTitle';
import ProductCard from '../components/products/ProductCard'; // Assuming ProductCard component exists

// --- Interfaces ---
interface WoodType { _id: string; name: string; description: string; image: string; properties: string[]; uses: string[]; }
interface ProductSummary { _id: string; name: string; image: string; wood: string; category?: string; price: number; images: { url: string }[]; ratings?: number; stock?: number;} // Added fields for ProductCard
interface Craftsman { _id: string; name: string; role: string; experience: string; image: string; specialty: string; }

// --- Mock Data (For Fallback) ---
const mockWoodTypes: WoodType[] = [
     { _id: 'wood1', name: 'Teak', description: 'Known for durability and water resistance...', image: 'https://images.pexels.com/photos/129733/pexels-photo-129733.jpeg?auto=compress&cs=tinysrgb&w=600', properties: ['Durable', 'Water-resistant', 'Low maintenance'], uses: ['Outdoor furniture', 'Luxury indoor pieces', 'Boat building'] },
     { _id: 'wood2', name: 'Sheesham', description: 'Also known as Indian Rosewood...', image: 'https://images.pexels.com/photos/301614/pexels-photo-301614.jpeg?auto=compress&cs=tinysrgb&w=600', properties: ['Dense', 'Strong', 'Beautiful grain'], uses: ['Tables', 'Chairs', 'Cabinets'] },
     { _id: 'wood3', name: 'Mango Wood', description: 'Sustainably harvested wood...', image: 'https://images.pexels.com/photos/5799097/pexels-photo-5799097.jpeg?auto=compress&cs=tinysrgb&w=600', properties: ['Sustainable', 'Unique colors', 'Medium hardness'], uses: ['Furniture', 'Decorative items', 'Kitchen accessories'] },
     { _id: 'wood4', name: 'Oak', description: 'A classic hardwood with excellent strength...', image: 'https://images.pexels.com/photos/172292/pexels-photo-172292.jpeg?auto=compress&cs=tinysrgb&w=600', properties: ['Strong', 'Durable', 'Classic appearance'], uses: ['Tables', 'Flooring', 'Cabinets'] },
 ];
 const mockProducts: ProductSummary[] = [
     { _id: 'prod1', name: 'Handcrafted Coffee Table', image: 'https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=600', wood: 'Teak', price: 18999, images: [{url: ''}] },
     { _id: 'prod2', name: 'Wooden Wall Shelves', image: 'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg?auto=compress&cs=tinysrgb&w=600', wood: 'Sheesham', price: 7999, images: [{url: ''}] },
     { _id: 'prod3', name: 'Decorative Wooden Bowl', image: 'https://images.pexels.com/photos/4846296/pexels-photo-4846296.jpeg?auto=compress&cs=tinysrgb&w=600', wood: 'Mango Wood', price: 2499, images: [{url: ''}] },
     { _id: 'prod4', name: 'Carved Wooden Stool', image: 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=600', wood: 'Oak', price: 5999, images: [{url: ''}] },
     { _id: 'prod5', name: 'Wooden Dining Set', image: 'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=600', wood: 'Teak', price: 55000, images: [{url: ''}] },
     { _id: 'prod6', name: 'Wooden Kitchen Utensils', image: 'https://images.pexels.com/photos/1055056/pexels-photo-1055056.jpeg?auto=compress&cs=tinysrgb&w=600', wood: 'Mango Wood', price: 1999, images: [{url: ''}] },
 ];
 const mockCraftsmen: Craftsman[] = [
     { _id: 'craf1', name: 'Rajesh Kumar', role: 'Master Craftsman', experience: '25+ years', image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600', specialty: 'Traditional Carving' },
     { _id: 'craf2', name: 'Amit Singh', role: 'Furniture Designer', experience: '15 years', image: 'https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=600', specialty: 'Contemporary Design' },
     { _id: 'craf3', name: 'Priya Sharma', role: 'Wood Finishing Expert', experience: '12 years', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600', specialty: 'Natural Stains' },
     { _id: 'craf4', name: 'Sunil Patel', role: 'Joinery Specialist', experience: '20 years', image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600', specialty: 'Dovetail & Mortise/Tenon' },
 ];
// --- End Mock Data ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const WoodenWorkPage: React.FC = () => {
    const [woodTypes, setWoodTypes] = useState<WoodType[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
    const [loading, setLoading] = useState({ wood: true, products: true, craftsmen: true });
    const [error, setError] = useState<string | null>(null);
    const [selectedWood, setSelectedWood] = useState<WoodType | null>(null);
    const [videoModalOpen, setVideoModalOpen] = useState(false);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any[]>>, loaderKey: keyof typeof loading, mockFallback: any[], selectFirst?: boolean) => {
            setLoading(prev => ({ ...prev, [loaderKey]: true }));
            let currentError = null;
            try {
                // console.log(`Fetching ${loaderKey} from ${API_BASE_URL}/${endpoint}`);
                // const response = await fetch(`${API_BASE_URL}/${endpoint}`);
                // if (!response.ok) throw new Error(`Failed to fetch ${loaderKey}`);
                // const data = await response.json();
                // if (!data.success) throw new Error(data.message || `API error fetching ${loaderKey}`);
                // const fetchedData = data[loaderKey] || []; // Adjust response key

                await new Promise(res => setTimeout(res, 400)); // Simulate delay
                const fetchedData = mockFallback; // Use mock data for now

                setter(fetchedData);
                if (selectFirst && fetchedData.length > 0 && !selectedWood) { // Only set initial if not already set
                    setSelectedWood(fetchedData[0]);
                }
            } catch (err: any) {
                console.error(`Fetch ${loaderKey} Error:`, err);
                currentError = `Failed to load ${loaderKey}.`;
                setter(mockFallback);
                if (selectFirst && mockFallback.length > 0 && !selectedWood) setSelectedWood(mockFallback[0]);
            } finally {
                setLoading(prev => ({ ...prev, [loaderKey]: false }));
                if(currentError) setError(prev => prev ? `${prev}\n${currentError}` : currentError);
            }
        };
        setError(null);
        fetchData('wood-types', setWoodTypes, 'wood', mockWoodTypes, true);
        fetchData('products?limit=6&isFeatured=true&tags=wooden', setProducts, 'products', mockProducts); // Example fetch for featured wooden products
        fetchData('team/craftsmen', setCraftsmen, 'craftsmen', mockCraftsmen);
    }, []); // Removed selectedWood from dependency array to prevent re-fetch on select

    // --- Event Handlers ---
    const handleWoodSelect = (wood: WoodType) => setSelectedWood(wood);
    const openVideoModal = () => setVideoModalOpen(true);
    const closeVideoModal = () => setVideoModalOpen(false);

    const getStepIcon = (iconName: 'Leaf' | 'Check' | 'PenTool'): React.ReactNode => {
        switch (iconName) {
            case 'Leaf': return <Leaf size={20} className="text-primary" />;
            case 'Check': return <Check size={20} className="text-primary" />;
            case 'PenTool': return <PenTool size={20} className="text-primary" />;
            default: return null;
        }
    };

    return (
        <PageTransition>
            {/* Hero section */}
            <section className="relative h-[70vh] md:h-[80vh] flex items-center isolate">
                 <div className="absolute inset-0 z-[-1]"> <img src="https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2" alt="Detailed view of wood grain texture" className="w-full h-full object-cover" loading="eager"/> <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div> </div> <div className="container-custom relative z-10 text-white"> <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}> <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-bold mb-4 leading-tight">The Art of Wood</h1> <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl text-gray-200"> Discover the beauty of traditional craftsmanship and premium, sustainable materials. </p> <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"> <Link to="/shop?category=Tables&category=Chairs&category=Storage&category=Beds" className="btn-primary inline-flex items-center justify-center space-x-2 px-8 py-3 text-base"> <span>Explore Wooden Furniture</span> <ArrowRight size={18} /> </Link> <button onClick={openVideoModal} className="group flex items-center space-x-3 text-white hover:text-primary-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full pr-4 pl-1 py-1"> <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:bg-primary-dark transition-colors duration-300"> <Play size={16} className="ml-0.5 fill-current" /> </div> <span className="font-poppins font-medium text-sm">Watch Our Craft</span> </button> </div> </motion.div> </div>
            </section>

            {/* Our Craftsmanship section */}
            <section className="py-20 overflow-hidden">
                 <div className="container-custom"> <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"> <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: true, amount: 0.2 }}> <span className="text-primary font-poppins font-semibold text-sm uppercase tracking-wider mb-2 inline-block">Our Process</span> <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-neutral-dark mt-1 mb-6"> Craftsmanship Forged by Time </h2> <p className="text-gray-700 mb-6 leading-relaxed"> At Homysa, we honor age-old woodworking traditions while embracing modern precision. This synergy allows us to create furniture of exceptional quality and enduring beauty. </p> <div className="space-y-5"> {[ { title: 'Material Selection', desc: 'We meticulously source sustainable hardwoods, ensuring quality and environmental responsibility.', icon: 'Leaf' as const }, { title: 'Traditional Joinery', desc: 'Employing time-tested techniques like dovetails and mortise & tenon for lasting strength.', icon: 'Check' as const }, { title: 'Hand Finishing', desc: 'Each piece is carefully sanded and finished by hand, highlighting the natural beauty of the wood.', icon: 'PenTool' as const } ].map((step, index) => ( <div key={index} className="flex items-start"> <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0 border border-primary/20 mt-0.5"> {getStepIcon(step.icon)} </div> <div> <h3 className="font-poppins font-semibold mb-1 text-neutral-dark">{step.title}</h3> <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p> </div> </div> ))} </div> </motion.div> <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: true, amount: 0.2 }} className="relative mt-8 lg:mt-0"> <div className="relative aspect-w-4 aspect-h-3 rounded-lg shadow-xl overflow-hidden"> <img src="https://images.pexels.com/photos/3637786/pexels-photo-3637786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Close-up of wood joinery detail" className="w-full h-full object-cover" loading="lazy"/> </div> <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="absolute -bottom-8 -left-8 bg-white p-4 rounded-lg shadow-lg max-w-[250px] border border-gray-100"> <div className="flex items-center mb-2"> <div className="mr-2 text-primary"><Users size={20}/></div> <h4 className="font-poppins font-semibold text-sm text-neutral-dark">Decades of Experience</h4> </div> <p className="text-gray-600 text-xs leading-relaxed"> Our master artisans bring an average of 15+ years of dedicated woodworking expertise. </p> </motion.div> </motion.div> </div> </div>
            </section>

             {/* Wood Types section */}
            <section className="py-20 bg-secondary-light">
                 <div className="container-custom">
                    <SectionTitle subtitle="Our Materials" title="Premium Woods We Use" className="text-neutral-dark" subtitleClassName="text-primary"/>
                     {loading.wood && <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary"/></div>}
                     {error && woodTypes.length === 0 && <div className="text-center text-red-500 bg-red-50 p-4 rounded border border-red-200"><AlertCircle className="inline mr-2"/> {error.includes('wood') ? error : 'Failed to load wood types.'}</div>}

                    {woodTypes.length > 0 && (
                        <>
                             <div className="flex flex-wrap justify-center mb-12 gap-3">
                                {woodTypes.map((wood) => (
                                    <button key={wood._id} onClick={() => handleWoodSelect(wood)}
                                        className={`px-5 py-2 rounded-full font-poppins font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${selectedWood?._id === wood._id ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-700 hover:bg-gray-100 shadow-sm border border-gray-200' }`}
                                        aria-pressed={selectedWood?._id === wood._id}>
                                        {wood.name}
                                    </button>
                                ))}
                            </div>
                            {/* Corrected Conditional Rendering */}
                             <AnimatePresence mode="wait">
                                {selectedWood && (
                                    <motion.div
                                        key={selectedWood._id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center bg-white p-8 rounded-lg shadow-lg border border-gray-100 overflow-hidden"
                                    >
                                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                                            <img src={selectedWood.image} alt={selectedWood.name} className="rounded-lg shadow-md w-full h-80 object-cover" loading="lazy"/>
                                        </motion.div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-poppins font-semibold text-neutral-dark mb-4">{selectedWood.name}</h3>
                                            <p className="text-gray-700 mb-6 text-sm leading-relaxed">{selectedWood.description}</p>
                                             <div className="mb-5"> <h4 className="font-poppins font-medium text-neutral-dark mb-2 text-base">Key Properties:</h4> <div className="flex flex-wrap gap-2"> {selectedWood.properties.map((property) => ( <span key={property} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"> {property} </span> ))} </div> </div>
                                             <div> <h4 className="font-poppins font-medium text-neutral-dark mb-2 text-base">Common Uses:</h4> <div className="flex flex-wrap gap-2"> {selectedWood.uses.map((use) => ( <span key={use} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"> {use} </span> ))} </div> </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </section>

             {/* Featured Wooden Products section */}
            <section className="py-20">
                 <div className="container-custom">
                    <SectionTitle subtitle="Our Creations" title="Featured Wooden Products" className="text-neutral-dark" subtitleClassName="text-primary"/>
                     {loading.products && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary"/></div>}
                     {error && products.length === 0 && <div className="text-center text-red-500 bg-red-50 p-4 rounded border border-red-200"><AlertCircle className="inline mr-2"/> {error.includes('product') ? error : 'Failed to load products.'}</div>}

                    {products.length > 0 && (
                         <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Corrected Map function */}
                                {products.slice(0, 6).map((product, index) => (
                                    // Use the imported ProductCard component
                                    <ProductCard
                                        key={product._id}
                                        product={product as any} // Cast if ProductSummary doesn't match ProductCard's expected Product type fully
                                        viewMode="grid"
                                    />
                                ))}
                            </div>
                            <div className="text-center mt-16"> <Link to="/shop?category=wooden" className="btn-outline px-8 py-3"> View All Wooden Products </Link> </div>
                         </>
                     )}
                      {!loading.products && products.length === 0 && !error && <p className="text-center text-gray-500">No featured wooden products found.</p>}
                </div>
            </section>

             {/* Master Craftsmen section */}
            <section className="py-20 bg-neutral-dark text-white">
                 <div className="container-custom">
                    <SectionTitle subtitle="Meet Our Artisans" title="The Hands Behind the Craft" className="text-white" subtitleClassName="text-primary-light"/>
                     {loading.craftsmen && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-white"/></div>}
                     {error && craftsmen.length === 0 && <div className="text-center text-red-300"><AlertCircle className="inline mr-2"/> {error.includes('team') ? error : 'Failed to load team information.'}</div>}

                    {craftsmen.length > 0 && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                             {craftsmen.map((craftsman, index) => (
                                <motion.div key={craftsman._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, amount: 0.3 }}
                                    className="text-center flex flex-col items-center group">
                                    <div className="relative mb-5 w-40 h-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                                        <img src={craftsman.image} alt={craftsman.name} className="w-full h-full object-cover" loading="lazy"/>
                                        <div className="absolute inset-0 bg-primary bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <h3 className="text-lg font-poppins font-semibold text-white">{craftsman.name}</h3>
                                    <p className="text-primary-light text-sm font-medium">{craftsman.role}</p>
                                    <p className="text-gray-400 mt-1 text-xs">Experience: {craftsman.experience}</p>
                                    <p className="text-gray-300 mt-1 text-xs italic">Specialty: {craftsman.specialty}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                     {!loading.craftsmen && craftsmen.length === 0 && !error && <p className="text-center text-gray-400">Team information coming soon.</p>}
                </div>
            </section>

             {/* Custom Order CTA section */}
             <section className="py-20 bg-primary text-white">
                  <div className="container-custom text-center"> <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-poppins font-bold mb-6">Have a Unique Vision?</motion.h2> <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }} className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-100"> Our master craftsmen can bring your bespoke wooden furniture ideas to life. Let's create something extraordinary. </motion.p> <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}> <Link to="/custom-order" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-3 text-base"> Request a Custom Piece </Link> </motion.div> </div>
            </section>

             {/* Video Modal */}
            <AnimatePresence>
                 {videoModalOpen && (
                     <motion.div
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                         onClick={closeVideoModal} >
                         <motion.div
                             initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                             className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl aspect-video" // Added aspect-video
                             onClick={e => e.stopPropagation()} >
                             <button className="absolute top-2 right-2 z-10 text-white hover:text-gray-300 bg-black/30 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white" onClick={closeVideoModal} aria-label="Close video player"> <X size={24} /> </button>
                             {/* Replace with your actual video embed code */}
                              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/prJ6hbV1IJk?si=vpv8BuWJyJXAIxEV&autoplay=1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                         </motion.div>
                     </motion.div>
                 )}
             </AnimatePresence>
        </PageTransition>
    );
};

export default WoodenWorkPage;