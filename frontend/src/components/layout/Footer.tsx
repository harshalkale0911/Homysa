// frontend/src/components/layout/footer.tsx
import React, { useState } from 'react'; // Import React
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react'; // Added icons

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setSubscribing(true);
        setError(null);
        setSubscribed(false); // Reset success state

        try {
            // TODO: Replace with your actual newsletter subscription API endpoint
            console.log("Attempting to subscribe email:", email);
            // const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, { // Example endpoint
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // });
            // const result = await response.json();
            // if (!response.ok || !result.success) {
            //     throw new Error(result.message || 'Subscription failed. Please try again.');
            // }

            // --- Simulate API call ---
            await new Promise(resolve => setTimeout(resolve, 1200));
             // Simulate potential error
             // if (email.includes('fail')) throw new Error("This email cannot be subscribed.");
             const result = { success: true, message: "Successfully subscribed!" }; // Simulated success
             if (!result.success) throw new Error(result.message); // Check success flag from API
            // --- End Simulation ---

            setSubscribed(true);
            setEmail(''); // Clear input on success
             // Optionally display success message from API: setError(null); setSubscribed(result.message);

        } catch (err: any) {
            console.error("Subscription error:", err);
            setError(err.message || 'An error occurred. Please try again.');
            setSubscribed(false);
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <footer className="bg-neutral-dark text-gray-300 pt-16 pb-8">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-12">
                    {/* Column 1: Logo and About */}
                    <div className="md:col-span-2 lg:col-span-1">
                         <Link to="/" className="inline-block mb-5 focus:outline-none focus:ring-1 focus:ring-primary rounded">
                             <h2 className="text-3xl font-poppins font-bold text-white hover:text-primary-light transition-colors">HOMYSA</h2>
                        </Link>
                        <p className="mb-6 text-sm leading-relaxed text-gray-400"> {/* Slightly lighter text */}
                            Crafting timeless furniture and inspiring interiors with passion and precision. Experience the Homysa difference in quality and design.
                        </p>
                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {/* Replace # with actual URLs */}
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                                <Facebook size={20} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                                <Instagram size={20} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white uppercase tracking-wider mb-5">Quick Links</h3>
                        <ul className="space-y-2.5 text-sm"> {/* Increased spacing */}
                            <li><Link to="/shop" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">Shop Collection</Link></li>
                            <li><Link to="/interior-design" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">Interior Design</Link></li>
                            <li><Link to="/wooden-work" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">Wooden Work</Link></li>
                            <li><Link to="/custom-order" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">Custom Orders</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">Contact</Link></li>
                             <li><Link to="/account" className="hover:text-white transition-colors hover:underline focus:outline-none focus:underline focus:text-white">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white uppercase tracking-wider mb-5">Contact Info</h3>
                        <ul className="space-y-4 text-sm"> {/* Increased spacing */}
                            <li className="flex items-start space-x-3">
                                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                                <span className="text-gray-400">123 Furniture Street, Design District, Mumbai, MH 400001, India</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={18} className="flex-shrink-0 text-primary" />
                                <a href="tel:+919307125756" className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:text-white">+91 930 712 5756</a>
                            </li>
                             <li className="flex items-start space-x-3"> {/* Use items-start for potentially long emails */}
                                <Mail size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                                <div className="flex flex-col">
                                     <a href="mailto:hkale6888@gmail.com" className="text-gray-400 hover:text-white transition-colors break-all focus:outline-none focus:text-white">hkale6888@gmail.com</a>
                                    <a href="mailto:info@homysa.com" className="text-gray-400 hover:text-white transition-colors break-all focus:outline-none focus:text-white">info@homysa.com</a>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-lg font-poppins font-semibold text-white uppercase tracking-wider mb-5">Newsletter</h3>
                        <p className="mb-4 text-sm leading-relaxed text-gray-400">Subscribe for exclusive updates, new arrivals, and special offers.</p>
                         <div className="mt-4">
                            {!subscribed ? (
                                <form onSubmit={handleSubscribe} className="space-y-3">
                                    <label htmlFor="footer-email" className="sr-only">Email address</label>
                                    <input
                                        id="footer-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(null); }} // Clear error on change
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full px-4 py-2.5 bg-neutral text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-500 text-sm transition-colors duration-200"
                                        aria-label="Email address for newsletter"
                                        aria-invalid={!!error}
                                        aria-describedby="newsletter-error"
                                    />
                                    {error && <p id="newsletter-error" className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
                                    <button
                                        type="submit"
                                        disabled={subscribing}
                                        className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark transition-colors py-2.5 rounded-md font-poppins font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-dark focus:ring-primary ${subscribing ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {subscribing ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
                                        {subscribing ? 'Subscribing...' : 'Subscribe'}
                                    </button>
                                </form>
                            ) : (
                                // Success Message
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-green-400 text-sm bg-green-900/30 border border-green-700 p-3 rounded-md" role="status">
                                    <CheckCircle size={18} /> Thank you for subscribing!
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-xs">
                    <p>© {new Date().getFullYear()} Homysa Furniture. All rights reserved.</p>
                    <div className="mt-2 space-x-3">
                         {/* TODO: Create actual pages for these */}
                         <Link to="/privacy-policy" className="hover:text-white hover:underline">Privacy Policy</Link>
                        <span>|</span>
                         <Link to="/terms-of-service" className="hover:text-white hover:underline">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;