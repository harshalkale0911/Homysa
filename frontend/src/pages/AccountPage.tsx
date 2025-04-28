// frontend/src/pages/AboutPage.tsx
import React, { useState, useEffect } from 'react'; // Import React
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Eye, Leaf, Heart, Award, Users2, Calendar } from 'lucide-react'; // Adjusted icons
import PageTransition from '../components/ui/PageTransition';
import SectionTitle from '../components/ui/SectionTitle';

// --- Interfaces for Data Structures ---
interface TeamMember { _id: string; name: string; role: string; bio: string; image: string; }
interface Milestone { _id: string; year: string; title: string; description: string; }
interface Value { _id: string; title: string; description: string; iconName: keyof typeof LucideIcons; } // Use keyof for icon names
interface Stat { _id: string; value: string; label: string; }

// --- Map icon names to Lucide components ---
// (Ensure lucide-react is installed: npm install lucide-react)
const LucideIcons = {
    Target: Target, // For Craftsmanship
    Leaf: Leaf,     // For Sustainability
    Heart: Heart,   // For Customer Focus
    Eye: Eye,       // For Innovation / Vision
    Award: Award,   // Example for Awards stat
    Users: Users2,  // Example for Clients stat (Users2 is group icon)
    Calendar: Calendar // Example for Experience stat
};

// --- Mock Data (Replace with API calls) ---
const mockTeamMembers: TeamMember[] = [
     { _id: 'tm1', name: 'Harshal Kale', role: 'Founder & Master Craftsman', bio: 'With over 25 years passion...', image: '/Screenshot 2025-04-23 172813.png' }, // Reference image in public folder
    { _id: 'tm2', name: 'Ananya Patel', role: 'Lead Interior Designer', bio: "Ananya brings creativity and expertise...", image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { _id: 'tm3', name: 'Pawan Muruskar', role: 'Design Director', bio: 'A graduate of the National Institute of Design...', image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { _id: 'tm4', name: 'Priya Sharma', role: 'Client Relations Manager', bio: 'Priya ensures every client receives personalized attention...', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600' },
];
const mockMilestones: Milestone[] = [
    { _id: 'ms1', year: '2010', title: 'Our Humble Beginning', description: 'Homysa was founded as a small workshop, driven by a passion for quality woodwork.' },
    { _id: 'ms2', year: '2015', title: 'Expansion & Innovation', description: 'We expanded our workshop and introduced contemporary design elements.' },
    { _id: 'ms3', year: '2018', title: 'Interior Design Service', description: 'Launched our full-service interior design division to offer holistic solutions.' },
    { _id: 'ms4', year: '2022', title: 'Sustainability Focus', description: 'Implemented enhanced sustainability practices in sourcing and production.' },
    { _id: 'ms5', year: 'Present', title: 'Growing Strong', description: 'Serving clients across the region with a dedicated team of skilled artisans.' },
];
const mockValues: Value[] = [
    { _id: 'v1', title: 'Craftsmanship', description: 'Dedicated to meticulous techniques and exceptional quality in every piece.', iconName: 'Target' },
    { _id: 'v2', title: 'Sustainability', description: "Committed to responsible sourcing and eco-friendly practices.", iconName: 'Leaf' },
    { _id: 'v3', title: 'Client Focus', description: "Listening carefully to bring our clients' unique visions to life.", iconName: 'Heart' },
    { _id: 'v4', title: 'Innovation', description: 'Blending tradition with modern design to create timeless yet relevant pieces.', iconName: 'Eye' },
];
const mockStats: Stat[] = [
    { _id: 's1', value: '14+', label: 'Years Experience', iconName: 'Calendar' },
    { _id: 's2', value: '1200+', label: 'Happy Clients', iconName: 'Users' },
    { _id: 's3', value: '500+', label: 'Custom Projects', iconName: 'Target' }, // Reusing icon
    { _id: 's4', value: '20+', label: 'Design Awards', iconName: 'Award' },
];
// --- End Mock Data ---

const AboutPage: React.FC = () => {
    // TODO: Replace mock data with state fetched from API endpoints
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
    const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
    const [values, setValues] = useState<Value[]>(mockValues);
    const [stats, setStats] = useState<Stat[]>(mockStats);
    // Add loading/error states if fetching data

    const getIconComponent = (iconName: keyof typeof LucideIcons) => {
        const IconComponent = LucideIcons[iconName];
        return IconComponent ? <IconComponent size={32} className="text-primary" /> : null;
    };

    return (
        <PageTransition>
            {/* Hero section */}
            <section className="relative py-36 px-6 bg-neutral-dark isolate"> {/* Use isolate */}
                <div className="absolute inset-0 opacity-15 z-[-1]"> {/* Ensure overlay is behind */}
                    <img
                        src="https://images.pexels.com/photos/3637786/pexels-photo-3637786.jpeg?auto=compress&cs=tinysrgb&w=1600"
                        alt="Homysa workshop background detail"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="container-custom text-center z-10 relative">
                    <motion.h1
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                         className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4">
                        About Homysa
                    </motion.h1>
                    <motion.p
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                         className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
                        Discover our story, values, and the passionate team bringing your furniture dreams to life.
                    </motion.p>
                </div>
            </section>

            {/* Our Story section */}
            <section className="py-20 overflow-hidden">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: true, amount: 0.2 }}
                            className="order-2 lg:order-1" // Text first on mobile
                        >
                            <span className="text-primary font-poppins font-semibold text-sm uppercase tracking-wider mb-2 inline-block">Our Story</span>
                            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-neutral-dark mt-1 mb-6">
                                Crafting Legacies Since 2010
                            </h2>
                            <div className="prose prose-sm sm:prose-base text-gray-700 max-w-none leading-relaxed space-y-4"> {/* Use Tailwind Prose for text styling */}
                                <p>
                                    Homysa began in a humble Pune workshop, fueled by a simple mission: to create beautiful, functional furniture celebrating the soul of wood. Founded by master craftsman Harshal Kale, we've grown from a small team to a thriving family of skilled designers and artisans.
                                </p>
                                <p>
                                    We believe furniture transcends mere function. It should tell your story, reflect your personality, and endure for generations. Each piece is meticulously crafted, blending time-honored woodworking traditions with contemporary design sensibilities.
                                </p>
                                <p>
                                    Today, we innovate with wood, creating custom furniture and transformative interior designs, always upholding our commitment to exceptional quality and sustainable practices.
                                </p>
                            </div>
                        </motion.div>
                         <motion.div
                             initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: true, amount: 0.2 }}
                            className="relative mt-8 lg:mt-0 order-1 lg:order-2" // Image second on mobile
                        >
                            <div className="relative aspect-w-4 aspect-h-3 rounded-lg shadow-lg overflow-hidden group">
                                <img
                                    src="https://images.pexels.com/photos/6306074/pexels-photo-6306074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                    alt="Craftsman meticulously working on wood"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                             {/* Smaller overlapping image */}
                             <motion.img
                                initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} viewport={{ once: true }}
                                src="https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=600"
                                alt="Homysa Workshop interior detail"
                                className="absolute -bottom-10 -right-6 sm:-bottom-12 sm:-right-8 w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-xl border-4 md:border-6 border-white"
                                loading="lazy"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Values section */}
            <section className="py-20 bg-secondary-light">
                <div className="container-custom">
                    <SectionTitle subtitle="What Drives Us" title="Our Core Values" className="text-neutral-dark" subtitleClassName="text-primary"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={value._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, amount: 0.4 }}
                                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow text-center flex flex-col items-center border border-gray-100 h-full" // Added h-full
                            >
                                <div className="w-16 h-16 mb-5 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                                    {getIconComponent(value.iconName)}
                                </div>
                                <h3 className="text-xl font-poppins font-semibold text-neutral-dark mb-3">{value.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed flex-grow">{value.description}</p> {/* flex-grow */}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats section */}
            <section className="py-20 bg-primary text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => {
                             const StatIcon = stat.iconName ? LucideIcons[stat.iconName as keyof typeof LucideIcons] : null;
                             return (
                                <motion.div
                                    key={stat._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                                >
                                     {StatIcon && <StatIcon size={36} className="mx-auto mb-3 opacity-50"/>}
                                    <div className="text-4xl md:text-5xl font-poppins font-bold mb-2">{stat.value}</div>
                                    <p className="text-sm md:text-base uppercase tracking-wider opacity-90">{stat.label}</p>
                                </motion.div>
                             );
                        })}
                    </div>
                </div>
            </section>

            {/* Our Team section */}
            <section className="py-20">
                <div className="container-custom">
                    <SectionTitle subtitle="The People Behind Homysa" title="Meet Our Expert Team" className="text-neutral-dark" subtitleClassName="text-primary"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member._id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, amount: 0.3 }}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group flex flex-col"
                            >
                                <div className="aspect-[4/5] overflow-hidden"> {/* Aspect ratio for consistent image height */}
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-5 text-center flex-grow flex flex-col"> {/* Ensure content area grows */}
                                    <h3 className="text-lg font-poppins font-semibold text-neutral-dark mb-1">{member.name}</h3>
                                    <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                                    {/* <p className="text-gray-600 text-xs leading-relaxed flex-grow">{member.bio}</p> Example Bio */}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Journey / Milestones section */}
            <section className="py-20 bg-secondary-light">
                <div className="container-custom">
                    <SectionTitle subtitle="Our Journey" title="Key Milestones" className="text-neutral-dark" subtitleClassName="text-primary"/>
                    <div className="relative pt-4 max-w-3xl mx-auto"> {/* Centered timeline */}
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 rounded-full transform md:-translate-x-1/2" aria-hidden="true"></div>

                        {/* Timeline items */}
                        <div className="space-y-12 relative">
                            {milestones.map((milestone, index) => (
                                <motion.div
                                    key={milestone._id}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} viewport={{ once: true, amount: 0.3 }}
                                    className="relative pl-10 md:pl-0" // Padding for mobile alignment
                                >
                                     {/* Timeline Dot */}
                                     <div className={`absolute left-4 md:left-1/2 top-1/2 md:top-1 transform -translate-x-1/2 -translate-y-1/2 md:-translate-y-0 w-24 h-8 rounded-md bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md z-10 ${index % 2 === 0 ? 'md:translate-x-[-50%] md:left-[calc(50%-6rem)]' : 'md:translate-x-[50%] md:left-[calc(50%+6rem)]'}`}>
                                        {milestone.year}
                                    </div>
                                     {/* Small connector dot on the line */}
                                     <div className="absolute left-4 md:left-1/2 top-1/2 md:top-1 transform -translate-x-1/2 -translate-y-1/2 md:-translate-y-0 w-4 h-4 bg-secondary-light border-2 border-primary rounded-full z-20"></div>

                                     {/* Content Card */}
                                     <div className={`w-full md:w-5/12 p-5 bg-white rounded-lg shadow-md border border-gray-100 ${index % 2 === 0 ? 'md:ml-auto md:mr-[calc(50%+2rem)]' : 'md:ml-[calc(50%+2rem)] md:mr-auto'} `}>
                                         <h3 className="text-base md:text-lg font-poppins font-semibold text-neutral-dark mb-2">{milestone.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{milestone.description}</p>
                                    </div>

                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="py-20 bg-neutral-dark text-white">
                <div className="container-custom text-center">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-poppins font-bold mb-6">Ready to Create Something Beautiful Together?</motion.h2>
                    <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
                        className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-300">
                        Whether it's a single custom piece or a full interior transformation, our team is excited to bring your vision to life.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}
                        className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/custom-order" className="btn-primary inline-flex items-center justify-center space-x-2 px-8 py-3">
                            <span>Request a Custom Quote</span>
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-3">
                            Contact Our Team
                        </Link>
                    </motion.div>
                </div>
            </section>
        </PageTransition>
    );
};

export default AboutPage;