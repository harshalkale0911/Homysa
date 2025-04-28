// frontend/src/components/home/WhyChooseUs.tsx
import React from 'react'; // Import React
import { motion } from 'framer-motion';
import { Shield, Gem, PenTool, PackageCheck, Users, Leaf } from 'lucide-react'; // Added Leaf, changed Tool to PenTool
import SectionTitle from '../ui/SectionTitle';

const features = [
    {
        icon: <Gem size={32} className="text-primary group-hover:scale-110 transition-transform" />, // Added hover effect
        title: 'Premium Materials',
        description: 'We source only the finest, sustainable woods and quality materials for enduring beauty and strength.',
    },
    {
        icon: <PenTool size={32} className="text-primary group-hover:scale-110 transition-transform" />, // Using PenTool
        title: 'Expert Craftsmanship',
        description: 'Each piece is meticulously handcrafted by skilled artisans with years of experience and passion.',
    },
     { // Added Sustainability
        icon: <Leaf size={32} className="text-primary group-hover:scale-110 transition-transform" />,
        title: 'Sustainable Practices',
        description: 'Committed to eco-friendly processes, from responsible wood sourcing to minimizing waste.',
    },
    // {
    //     icon: <Shield size={32} className="text-primary group-hover:scale-110 transition-transform" />,
    //     title: '5-Year Warranty', // Consider if warranty is a key differentiator
    //     description: 'We stand confidently behind our work with an industry-leading warranty for your peace of mind.',
    // },
     {
         icon: <Users size={32} className="text-primary group-hover:scale-110 transition-transform" />,
         title: 'Dedicated Support',
         description: 'From initial consultation to aftercare, our friendly team is here to assist you every step of the way.',
     },
];

const WhyChooseUs: React.FC = () => {
    return (
        <section className="py-20 bg-neutral-dark text-white">
            <div className="container-custom">
                <SectionTitle
                    subtitle="Our Advantages"
                    title="Why Choose Homysa?"
                    className="text-white" // Ensure title color is white on dark bg
                    subtitleClassName="text-primary-light" // Use lighter primary for subtitle
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            className="text-center p-6 rounded-lg bg-neutral bg-opacity-40 hover:bg-opacity-50 transition-all duration-300 flex flex-col items-center group border border-neutral/20 hover:border-primary/30" // Added group and border
                        >
                            {/* Icon background */}
                             <div className="w-16 h-16 mb-5 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/30 transition-colors duration-300 group-hover:bg-primary/20">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-poppins font-semibold mb-3 text-white">
                                {feature.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed flex-grow"> {/* Added flex-grow */}
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;