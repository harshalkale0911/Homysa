// frontend/src/components/ui/PageTransition.tsx
import { motion } from 'framer-motion';
import React, { ReactNode } from 'react'; // Import React

interface PageTransitionProps {
    children: ReactNode;
}

// Define animation variants for the page transition
const pageVariants = {
    initial: {
        opacity: 0,
        y: 15, // Start slightly below
        // filter: 'blur(4px)', // Optional blur effect
    },
    animate: {
        opacity: 1,
        y: 0,
        // filter: 'blur(0px)',
        transition: {
            duration: 0.5, // Control the speed
            ease: [0.43, 0.13, 0.23, 0.96], // Custom cubic bezier (easeOutExpo like)
            // type: "spring", // Alternative: spring animation
            // stiffness: 100,
            // damping: 15,
        },
    },
    exit: {
        opacity: 0,
        y: -10, // Exit slightly upwards
        // filter: 'blur(4px)',
        transition: {
            duration: 0.3, // Faster exit animation
            ease: [0.43, 0.13, 0.23, 0.96],
        },
    },
};

/**
 * A wrapper component that applies fade and slide animations
 * to its children when routes change. Requires AnimatePresence
 * in the parent component (e.g., App.tsx) and a unique key
 * on the Routes component (usually location.pathname).
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    // No need for useLocation here; the key is handled in App.tsx
    return (
        <motion.div
            // The key prop will be provided by AnimatePresence based on the Routes key in App.tsx
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;