// frontend/src/components/home/HeroSection.tsx
import React, { useEffect, useState, useCallback } from 'react'; // Import React and useCallback
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Data for the slides
const slides = [
    {
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2', // Higher res?
        title: 'Handcrafted Furniture',
        subtitle: 'Designed for your comfort & style',
        tag: 'Premium Furniture Collection'
    },
    {
        image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'Bespoke Interior Design',
        subtitle: 'Transform your space into a haven',
        tag: 'Interior Design Services'
    },
    {
        image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
        title: 'Uncompromising Quality',
        subtitle: 'Crafted with passion, built to last',
        tag: 'Timeless Craftsmanship'
    },
];

// Animation Variants
const backgroundVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeInOut" } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: "easeInOut" } },
};

const textVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
};


const HeroSection: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Use useCallback for functions used in useEffect dependencies
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, []); // No dependencies needed as slides.length is constant here

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Autoplay effect
    useEffect(() => {
        const interval = setInterval(nextSlide, 7000); // Increase interval slightly
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [nextSlide]); // Depend on the memoized nextSlide function


    // Preload images (simple approach)
     useEffect(() => {
         slides.forEach(slide => {
             const img = new Image();
             img.src = slide.image;
         });
     }, []);

    return (
        // Added aria attributes for accessibility
        <section
            className="relative h-screen overflow-hidden bg-neutral-dark"
            aria-roledescription="carousel"
            aria-label="Hero sections showing furniture and interior design"
        >
             {/* Screen reader announcement for slide changes */}
             <div className="sr-only" aria-live="polite" aria-atomic="true">
                 Slide {currentSlide + 1} of {slides.length}: {slides[currentSlide].title}
             </div>

            {/* Slides */}
            <AnimatePresence initial={false}> {/* Use AnimatePresence for enter/exit */}
                <motion.div
                    key={currentSlide} // Key change triggers animation
                    variants={backgroundVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0"
                    aria-hidden={true} // Hide decorative background from screen readers
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" /> {/* Slightly adjusted gradient */}
                </motion.div>
            </AnimatePresence>

            {/* Content - Use AnimatePresence here too for smoother text transitions */}
            <div className="container-custom relative h-full flex items-center z-10">
                <div className="max-w-2xl text-white">
                    <AnimatePresence mode="wait">
                         {/* Animated content block */}
                         <motion.div
                            key={currentSlide} // Key change triggers animation
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ staggerChildren: 0.15 }} // Stagger children animations
                        >
                            <motion.span
                                variants={textVariants}
                                className="inline-block mb-4 px-4 py-1 bg-primary text-white text-sm rounded-full font-poppins font-medium"
                            >
                                {slides[currentSlide].tag}
                            </motion.span>

                            <motion.h1
                                variants={textVariants}
                                className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-4 leading-tight"
                            >
                                {slides[currentSlide].title}
                            </motion.h1>

                            <motion.p
                                variants={textVariants}
                                className="text-lg md:text-xl mb-8 text-gray-200"
                            >
                                {slides[currentSlide].subtitle}
                            </motion.p>

                            <motion.div
                                variants={textVariants}
                                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                            >
                                <Link to="/shop" className="btn-primary inline-flex items-center justify-center sm:justify-start space-x-2 px-8 py-3 text-base"> {/* Slightly larger text */}
                                    <span>Explore Collection</span>
                                    <ArrowRight size={20} /> {/* Slightly larger icon */}
                                </Link>
                                <Link to="/custom-order" className="btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-base">
                                    Get a Free Quote
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Slider indicators */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={currentSlide === index ? 'step' : undefined}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSection;