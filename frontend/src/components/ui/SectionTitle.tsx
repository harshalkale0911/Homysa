// frontend/src/components/ui/SectionTitle.tsx
import React from 'react'; // Import React
import { motion } from 'framer-motion';

interface SectionTitleProps {
    subtitle?: string;
    title: string;
    alignment?: 'left' | 'center' | 'right';
    className?: string; // Allow passing extra classes for the container
    subtitleClassName?: string; // Specific classes for subtitle
    titleClassName?: string; // Specific classes for title
}

const SectionTitle: React.FC<SectionTitleProps> = ({
    subtitle,
    title,
    alignment = 'center',
    className = '',
    subtitleClassName = '',
    titleClassName = ''
}) => {

    const alignmentClasses = {
        left: 'text-left items-start',
        center: 'text-center items-center mx-auto',
        right: 'text-right items-end ml-auto',
    };

    // Combine base, alignment, and passed classes for the main container
    const containerClasses = `mb-12 max-w-3xl flex flex-col ${alignmentClasses[alignment]} ${className}`;

    // Default title color based on common usage (assuming light background)
    // Parent component can override via titleClassName if needed (e.g., for dark backgrounds)
    const defaultTitleColor = 'text-neutral-dark';

    return (
        <div className={containerClasses}>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.5 }} // Trigger when 50% in view
                    // Combine default, alignment specific, and passed classes for subtitle
                    className={`text-sm md:text-base text-primary font-poppins font-semibold tracking-wide uppercase mb-2 ${subtitleClassName}`}
                >
                    {subtitle}
                </motion.p>
            )}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: subtitle ? 0.1 : 0, ease: "easeOut" }} // Delay only if subtitle exists
                viewport={{ once: true, amount: 0.5 }}
                // Combine default size/font, default color, alignment, and passed classes for title
                className={`text-3xl md:text-4xl lg:text-[2.5rem] font-poppins font-semibold leading-tight ${defaultTitleColor} ${titleClassName}`} // Added responsive size
            >
                {title}
            </motion.h2>
        </div>
    );
};

export default SectionTitle;