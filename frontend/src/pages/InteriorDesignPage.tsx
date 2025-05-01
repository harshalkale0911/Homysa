// frontend/src/pages/InteriorDesignPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Home, DraftingCompass, Palette, ClipboardList, Presentation, Bed, Loader2, AlertCircle } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import SectionTitle from '../components/ui/SectionTitle';
import ProductCard from '../components/products/ProductCard'; // Use ProductCard for display

// --- Interfaces ---
// Use the Product interface, assuming projects are stored like products
interface ProjectAsProduct {
    _id: string;
    name: string; // Use product name as project title
    description: string;
    images: { url: string }[]; // Use product images
    category: string; // Will be "Interior Design Project"
    subCategory?: string; // Optional: Add a field for Residential/Commercial if needed
    slug?: string; // Optional for linking
    // Add other fields needed from Product model if necessary
    price?: number; // Price might not be relevant here
    ratings?: number;
    stock?: number;
}

interface Service { title: string; description: string; icon: React.ReactNode; }

// --- Static Data ---
const services: Service[] = [
    { title: 'Space Planning & Layout', description: 'Optimizing flow and functionality for your unique space.', icon: <Home size={28} /> },
    { title: 'Custom Furniture Design', description: 'Bespoke pieces crafted to perfectly fit your style and needs.', icon: <DraftingCompass size={28} /> },
    { title: 'Material & Color Consultation', description: 'Expert guidance on selecting finishes, fabrics, and palettes.', icon: <Palette size={28} /> },
    { title: '3D Visualization', description: 'Realistic renderings to preview your transformed space.', icon: <Presentation size={28} /> },
    { title: 'Project Management', description: 'Seamless coordination from concept to final installation.', icon: <ClipboardList size={28} /> },
    { title: 'Styling & Accessorizing', description: 'Curating the perfect finishing touches to complete the look.', icon: <Bed size={28} /> },
];
// Define filter categories (these might map to a 'subCategory' field in your Product model)
const projectSubCategories = ['All Projects', 'Residential', 'Commercial', 'Hospitality'];
const MAIN_PROJECT_CATEGORY = 'Interior Design Project'; // The main category to filter by

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const InteriorDesignPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All Projects'); // Corresponds to subCategory
    const [projects, setProjects] = useState<ProjectAsProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Projects (as Products) ---
    useEffect(() => {
        const fetchProjects = async () => {
             setLoading(true);
             setError(null);
             const params = new URLSearchParams();
             params.set('category', MAIN_PROJECT_CATEGORY); // Filter by the main project category
             params.set('limit', '9'); // Adjust limit as needed

             // Apply sub-category filter if selected (requires 'subCategory' field in Product model)
             if (activeFilter !== 'All Projects') {
                 params.set('subCategory', activeFilter); // Use a field like 'subCategory' or 'tags'
             }
             const apiUrl = `${API_BASE_URL}/products?${params.toString()}`; // Fetch from /products endpoint

             try {
                 console.log(`Fetching projects (as products) from: ${apiUrl}`);
                 const response = await fetch(apiUrl);
                 if (!response.ok) {
                     const errorData = await response.json().catch(() => ({}));
                     throw new Error(errorData.message || `Failed to fetch projects (${response.status})`);
                 }
                 const data = await response.json();
                 if (!data.success) {
                     throw new Error(data.message || 'API error fetching projects');
                 }
                 setProjects(data.products || []);

             } catch (err: any) {
                 console.error("Fetch Projects Error:", err);
                 setError(err.message || 'An error occurred while fetching projects.');
                 setProjects([]); // Clear projects on error
             } finally {
                 setLoading(false);
             }
        };
        fetchProjects();
    }, [activeFilter]); // Re-fetch when filter changes

    // No client-side filtering needed if API handles it
    // const filteredProjects = projects; // Use API results directly

    return (
        <PageTransition>
            {/* Hero section */}
            <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center text-center isolate">
                <div className="absolute inset-0 z-[-1]"> <img src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2" alt="Beautifully designed modern living room interior" className="w-full h-full object-cover" loading="eager"/> <div className="absolute inset-0 bg-black bg-opacity-50"></div> </div>
                <div className="container-custom relative z-10 text-white px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-bold mb-4 leading-tight">Interior Design Services</h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200"> Crafting inspiring spaces tailored to your lifestyle, blending aesthetics with functionality. </p>
                        <Link to="/contact?subject=Interior Design Consultation" className="btn-primary inline-flex items-center space-x-2 px-8 py-3 text-base"> <span>Request a Consultation</span> <ArrowRight size={18} /> </Link>
                    </motion.div>
                </div>
            </section>

            {/* Services section */}
            <section className="py-20 bg-secondary-light">
                <div className="container-custom">
                    <SectionTitle subtitle="What We Offer" title="Our Interior Design Expertise" className="text-neutral-dark" subtitleClassName="text-primary"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, amount: 0.3 }} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col items-center text-center border border-gray-100 h-full"> <div className="text-primary mb-5 bg-primary/10 p-4 rounded-full inline-block"> {service.icon} </div> <h3 className="text-lg md:text-xl font-poppins font-semibold text-neutral-dark mb-3">{service.title}</h3> <p className="text-gray-600 text-sm leading-relaxed flex-grow">{service.description}</p> </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio section */}
            <section className="py-20">
                <div className="container-custom">
                    <SectionTitle subtitle="Our Work" title="Interior Design Portfolio" className="text-neutral-dark" subtitleClassName="text-primary"/>
                    {/* Filter buttons (assuming they filter by subCategory) */}
                    <div className="flex flex-wrap justify-center mb-12 gap-3">
                        {projectSubCategories.map(category => (
                            <button key={category} onClick={() => setActiveFilter(category)} className={`px-5 py-2 rounded-full font-poppins font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${activeFilter === category ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-neutral-700 hover:bg-gray-200'}`}> {category} </button>
                        ))}
                    </div>

                     {/* Loading / Error / Empty States */}
                     {loading && <div className="flex justify-center items-center py-10 min-h-[300px]"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                     {error && <div className="text-center py-10 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200" role="alert"><AlertCircle size={32} className="mx-auto mb-2"/><p>{error}</p></div>}
                    {!loading && !error && projects.length === 0 && <p className="text-center py-12 text-gray-500">No projects found {activeFilter !== 'All Projects' ? `for '${activeFilter}'` : ''}.</p>}

                    {/* Projects grid - Use ProductCard */}
                    {projects.length > 0 && (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                // Render each project using the ProductCard component
                                // Pass the project data (casted as Product type if needed)
                                <ProductCard
                                    key={project._id}
                                    product={project as any} // Cast or ensure ProjectAsProduct matches ProductCard props
                                    viewMode="grid"
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Design Process section */}
            <section className="py-20 bg-neutral-dark text-white overflow-hidden">
                 <div className="container-custom">
                     <SectionTitle subtitle="How We Work" title="Our Design Process" className="text-white" subtitleClassName="text-primary-light"/>
                      <div className="relative">
                         <div className="absolute left-4 md:left-1/2 top-5 bottom-5 w-1 bg-primary/50 transform md:-translate-x-1/2 rounded-full" aria-hidden="true"></div>
                         <div className="space-y-20 md:space-y-24 relative mt-8">
                             {[ { title: 'Consultation & Brief', desc: 'We start with an in-depth discussion to understand your vision, lifestyle, needs, and budget.', img: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750' }, { title: 'Concept Development', desc: 'Our designers create mood boards, material palettes, and initial layouts based on the brief.', img: 'https://images.pexels.com/photos/6444/pencil-typography-black-design.jpg?auto=compress&cs=tinysrgb&w=1260&h=750' }, { title: 'Design & Visualization', desc: 'Detailed plans and realistic 3D renderings bring the concept to life for your review and feedback.', img: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750' }, { title: 'Implementation & Styling', desc: 'Skilled execution, project management, and final styling ensure a flawless result.', img: 'https://images.pexels.com/photos/6267516/pexels-photo-6267516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750' } ].map((step, index) => (
                                 <motion.div key={index} initial={{ opacity: 0, x: index % 2 !== 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} viewport={{ once: true, amount: 0.3 }}
                                    className={`relative flex flex-col ${index % 2 !== 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}>
                                     <div className={`md:w-5/12 order-2 ${index % 2 !== 0 ? 'md:order-1' : 'md:order-2'}`}> <div className="bg-neutral bg-opacity-40 p-6 rounded-lg shadow-lg border border-neutral/30"> <h3 className="text-xl font-poppins font-semibold mb-3 text-primary-light">{`${index + 1}. ${step.title}`}</h3> <p className="text-gray-300 text-sm leading-relaxed">{step.desc}</p> </div> </div>
                                     <div className={`md:w-5/12 order-1 ${index % 2 !== 0 ? 'md:order-2' : 'md:order-1'}`}> <img src={step.img} alt={step.title} className="rounded-lg shadow-xl w-full aspect-video object-cover" loading="lazy"/> </div>
                                     <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 transform -translate-x-1/2 md:-translate-y-1/2 w-6 h-6 rounded-full bg-secondary border-4 border-primary shadow-md z-10 flex items-center justify-center"> <div className="w-2 h-2 bg-primary rounded-full"></div> </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-20 bg-primary text-white">
                <div className="container-custom text-center">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-poppins font-bold mb-6">Ready to Reimagine Your Space?</motion.h2>
                    <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }} className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-100"> Let's collaborate! Contact our expert interior design team today to schedule your initial consultation. </motion.p>
                     <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/contact?subject=Interior Design Inquiry" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-3 text-base"> Request Consultation </Link>
                        <Link to="/custom-order" className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-base"> Explore Custom Furniture </Link>
                    </motion.div>
                </div>
            </section>
        </PageTransition>
    );
};

export default InteriorDesignPage;