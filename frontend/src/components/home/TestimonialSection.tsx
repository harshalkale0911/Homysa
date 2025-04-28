// frontend/src/components/home/TestimonialSection.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Import React and useCallback
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Loader2, AlertCircle } from 'lucide-react'; // Added Quote icon
import SectionTitle from '../ui/SectionTitle';

// Define interface for Testimonial data (Align with backend)
interface Testimonial {
    _id: string; // Use MongoDB _id
    name: string;
    role?: string; // Optional role
    quote: string;
    rating: number;
    image?: string; // Optional image URL
    createdAt?: string; // Optional date
}

// --- Mock Data (REMOVE when API is integrated) ---
const mockTestimonials: Testimonial[] = [
    { _id: 't1', name: 'Priya Sharma', role: 'Homeowner', quote: "Homysa transformed our living room with their custom wooden furniture. The attention to detail and craftsmanship is exceptional. We're absolutely in love with our new space!", rating: 5, image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { _id: 't2', name: 'Rajesh Patel', role: 'Office Manager', quote: 'We hired Homysa to redesign our office space with ergonomic furniture. The result was beyond our expectations - beautiful, functional, and delivered on schedule.', rating: 4, image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { _id: 't3', name: 'Ananya Gupta', role: 'Interior Designer', quote: "As a designer, I've worked with many furniture companies, but Homysa stands out for their craftsmanship and attention to detail. Their custom pieces elevate any space.", rating: 5, image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { _id: 't4', name: 'Vikram Mehta', role: 'Architect', quote: "The quality of the wood and the finishing is top-notch. Homysa's team was professional and easy to work with throughout our custom project.", rating: 5, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'}
];
// --- End Mock Data ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

const TestimonialSection = () => {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0); // 0: initial, 1: next, -1: prev
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]); // Start empty
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch testimonials from API ---
    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            setError(null);
            try {
                // TODO: Replace with your actual API endpoint
                // Example: Fetch featured or recent testimonials, limit the number
                const response = await fetch(`${API_BASE_URL}/testimonials?featured=true&limit=5`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                     throw new Error(errorData.message || `Failed to fetch testimonials (${response.status})`);
                }
                const data = await response.json();

                if (!data.success) {
                     throw new Error(data.message || 'API error fetching testimonials');
                }

                const fetchedData = data.testimonials || [];
                setTestimonials(fetchedData);

                if (fetchedData.length === 0) {
                     // Use mock data as fallback if API returns empty but no error
                     console.warn("No testimonials fetched from API, using mock data.");
                     setTestimonials(mockTestimonials);
                     // Alternatively, show an "empty" message instead of mock data:
                     // setError("No testimonials available yet.");
                }
            } catch (err: any) {
                console.error("Fetch Testimonials Error:", err);
                setError(err.message || 'An error occurred while loading testimonials.');
                // Use mock data as fallback on error
                 console.warn("Using mock testimonials due to fetch error.");
                setTestimonials(mockTestimonials);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []); // Fetch only on mount

    // Use useCallback for handlers used in useEffect
    const handleNext = useCallback(() => {
        if (testimonials.length <= 1) return;
        setDirection(1);
        setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, [testimonials.length]);

    const handlePrev = useCallback(() => {
         if (testimonials.length <= 1) return;
        setDirection(-1);
        setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    }, [testimonials.length]);

     const goToIndex = (index: number) => {
         if (index === current || testimonials.length <= 1) return;
         setDirection(index > current ? 1 : -1);
         setCurrent(index);
    };

    // Auto-play functionality
    useEffect(() => {
        if (testimonials.length <= 1 || loading || error) return; // Don't autoplay if loading, error, or <=1 item
        const interval = setInterval(handleNext, 8000); // Auto-play interval
        return () => clearInterval(interval); // Cleanup
    }, [testimonials.length, loading, error, handleNext]); // Re-run if dependencies change

    // Framer Motion variants for sliding effect
    const sliderVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            zIndex: 1, // Ensure current slide is on top
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0, // Ensure exiting slide is behind
            x: direction < 0 ? '100%' : '-100%', // Opposite direction for exit
            opacity: 0,
        }),
    };

     const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-10 min-h-[250px]">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            );
        }

         if (error && testimonials.length === 0) { // Show error only if no fallback data is available
             return (
                <div className="text-center py-10 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200" role="alert">
                    <AlertCircle size={32} className="mx-auto mb-2"/>
                    <p>{error}</p>
                </div>
            );
         }

        if (testimonials.length === 0) {
             return <p className="text-center text-gray-500 py-10">No client testimonials available yet.</p>;
        }

         // Ensure currentTestimonial is valid before accessing its properties
         const currentTestimonial = testimonials[current];
         if (!currentTestimonial) return null; // Should not happen if testimonials.length > 0

        return (
            <div className="relative max-w-4xl mx-auto">
                 {/* Testimonial slider container */}
                <div className="relative h-[320px] sm:h-[280px] md:h-[250px] overflow-hidden"> {/* Increased height slightly */}
                     <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={current} // Key change triggers animation
                            custom={direction}
                            variants={sliderVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.3 }
                            }}
                            className="absolute inset-0 p-6 md:p-8 rounded-xl bg-white shadow-lg border border-gray-100"
                        >
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-8">
                                <div className="flex-shrink-0 text-center">
                                    <img
                                        src={currentTestimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTestimonial.name)}&background=random&color=fff&size=128`} // Fallback avatar
                                        alt={currentTestimonial.name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/30 mx-auto shadow-md" // Adjusted border
                                        loading="lazy"
                                    />
                                     <div className="flex justify-center mt-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`mr-0.5 ${i < currentTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left flex-grow">
                                    <Quote size={36} className="absolute -top-2 -left-2 text-primary/10 transform rotate-180" aria-hidden="true"/>
                                    <blockquote className="text-base md:text-lg italic mb-4 text-neutral-700 font-normal relative leading-relaxed">
                                        {currentTestimonial.quote}
                                    </blockquote>
                                     <Quote size={36} className="absolute -bottom-2 -right-2 text-primary/10" aria-hidden="true"/>
                                    <div className="mt-4">
                                        <h4 className="font-poppins font-semibold text-neutral-dark text-lg">
                                            {currentTestimonial.name}
                                        </h4>
                                        {currentTestimonial.role && (
                                            <p className="text-sm text-gray-500">{currentTestimonial.role}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation buttons (Only show if more than 1 testimonial) */}
                {testimonials.length > 1 && (
                     <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-0 sm:-px-6 md:-px-10 pointer-events-none">
                        <button
                            onClick={handlePrev}
                            className="pointer-events-auto p-2 rounded-full bg-white/80 shadow-md hover:bg-primary hover:text-white backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="pointer-events-auto p-2 rounded-full bg-white/80 shadow-md hover:bg-primary hover:text-white backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                {/* Dots indicator (Only show if more than 1 testimonial) */}
                {testimonials.length > 1 && (
                    <div className="flex justify-center space-x-2.5 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 ${index === current ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                                aria-current={current === index ? 'step' : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
     };

    return (
        <section className="py-20 bg-secondary-light overflow-hidden"> {/* Added overflow-hidden */}
            <div className="container-custom">
                <SectionTitle
                    subtitle="Testimonials"
                    title="What Our Clients Say"
                    className="text-neutral-dark"
                    subtitleClassName="text-primary"
                />
                 {renderContent()}
            </div>
        </section>
    );
};

export default TestimonialSection;