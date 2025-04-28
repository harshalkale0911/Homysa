// frontend/src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogIn, LogOut, Search, Loader2, ChevronDown } from 'lucide-react'; // Added ChevronDown

// --- Authentication Hook Placeholder ---
// Replace this with your actual context or state management hook
const useAuth = () => {
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    const [user, setUser] = useState<{ _id: string; name: string; email: string; role: string; } | null>(null);

    // Simulate checking auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            setAuthStatus('loading');
            try {
                 // console.log("Header: Checking auth status...");
                const response = await fetch('/api/v1/me', { credentials: 'include' }); // Adjust API URL if needed
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                         // console.log("Header: User authenticated:", data.user.name);
                        setUser(data.user);
                        setAuthStatus('authenticated');
                    } else {
                         // console.log("Header: User not authenticated (API response negative).");
                        setUser(null);
                        setAuthStatus('unauthenticated');
                    }
                } else if (response.status === 401) {
                    // console.log("Header: Auth check returned 401 Unauthorized.");
                    setUser(null);
                    setAuthStatus('unauthenticated');
                } else {
                    throw new Error(`Auth check failed: ${response.status}`);
                }
            } catch (error) {
                console.error("Header Auth check failed:", error);
                setUser(null);
                setAuthStatus('unauthenticated'); // Assume unauthenticated on error
            }
        };
        checkAuth();
    }, []); // Run only once

    const logout = async () => {
        setAuthStatus('loading'); // Indicate loading during logout
        try {
            await fetch('/api/v1/logout', { method: 'GET', credentials: 'include' });
            setUser(null);
            setAuthStatus('unauthenticated');
        } catch (error) {
            console.error("Logout API call failed:", error);
            setAuthStatus('unauthenticated'); // Still update state
        }
    };

    return { authStatus, user, logout };
};
// --- End Auth Hook Placeholder ---


const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { authStatus, user, logout } = useAuth(); // Use the auth hook

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50); // Adjust threshold
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on location change
    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname]);

    const handleLogoutClick = async () => {
        closeMobileMenu(); // Close mobile menu if open
        await logout();
        navigate('/'); // Redirect to home after logout
    };

    // Define navigation links
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Interior Design', path: '/interior-design' },
        { name: 'Wooden Work', path: '/wooden-work' },
        { name: 'Custom Order', path: '/custom-order' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    // Define header styles based on scroll state
    const baseClasses = "fixed w-full z-50 transition-all duration-300 ease-in-out";
    const scrolledClasses = "bg-white shadow-md py-3 text-neutral-dark";
    const topClasses = "bg-gradient-to-b from-black/40 via-black/20 to-transparent py-5 text-white"; // Gradient for top state
    const headerClasses = `${baseClasses} ${isScrolled || isMobileMenuOpen ? scrolledClasses : topClasses}`; // Apply scrolled styles if mobile menu is open too
    const textColorClass = isScrolled || isMobileMenuOpen ? 'text-neutral-dark' : 'text-white';
    const logoColorClass = isScrolled || isMobileMenuOpen ? 'text-primary' : 'text-white';
    const iconHoverClass = isScrolled || isMobileMenuOpen ? 'hover:text-primary' : 'hover:text-primary-light'; // Adjust hover color

    // TODO: Get Cart Count from State/Context
    const cartItemCount = 0; // Replace with actual count

    // Common NavLink styling function
    const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `font-poppins font-medium text-sm relative transition-colors duration-200 ${iconHoverClass} focus:outline-none focus:text-primary after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${isActive ? 'text-primary after:w-full' : textColorClass}`;

    // Mobile NavLink styling function
     const getMobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `font-poppins font-medium py-2.5 px-3 block rounded transition-colors hover:text-primary focus:outline-none focus:text-primary ${isActive ? 'text-primary bg-primary/10' : 'text-neutral-dark'}`;


    return (
        <header className={headerClasses}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-full"> {/* Ensure consistent height */}
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" onClick={closeMobileMenu}>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                            className={`text-2xl md:text-3xl font-poppins font-bold transition-colors duration-300 ${logoColorClass}`}
                        >
                            HOMYSA
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        {navLinks.map((link) => (
                            <NavLink key={link.name} to={link.path} className={getNavLinkClasses}>
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Desktop Icons & Auth */}
                    <div className={`hidden lg:flex items-center space-x-3 ${textColorClass}`}>
                         {/* Search Icon */}
                        <button title="Search" aria-label="Search" className={`p-2 rounded-full ${iconHoverClass} transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}>
                            <Search size={20} />
                        </button>

                        {/* Auth Buttons/Links */}
                        {authStatus === 'loading' ? (
                            <div className="p-2"><Loader2 size={20} className="animate-spin"/></div>
                        ) : authStatus === 'authenticated' ? (
                            <div className="relative group"> {/* Dropdown container */}
                                <Link to="/account" title="My Account" aria-label="My Account" className={`flex items-center p-2 rounded-full ${iconHoverClass} transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}>
                                    <User size={20} />
                                    {/* <ChevronDown size={16} className="ml-1 group-hover:rotate-180 transition-transform"/> */}
                                </Link>
                                 {/* Dropdown Menu (Example structure - needs styling and state) */}
                                 {/* <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 border border-gray-100">
                                     <div className="px-4 py-2 text-sm text-gray-700 border-b">Hi, {user?.name}</div>
                                     <Link to="/account/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                                     <Link to="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                                     <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                                 </div> */}
                            </div>
                        ) : (
                            <Link to="/auth" title="Login / Sign Up" aria-label="Login or Sign Up" className={`p-2 rounded-full ${iconHoverClass} transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}>
                                <LogIn size={20} />
                            </Link>
                        )}

                         {/* Logout Button (Separate for clarity if no dropdown) */}
                         {authStatus === 'authenticated' && (
                            <button onClick={handleLogoutClick} title="Logout" aria-label="Logout" className={`p-2 rounded-full hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500`}>
                                <LogOut size={20} />
                            </button>
                         )}

                        {/* Cart Icon */}
                        <Link to="/cart" title="Shopping Cart" aria-label={`Shopping Cart with ${cartItemCount} items`} className={`p-2 relative rounded-full ${iconHoverClass} transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}>
                            <ShoppingCart size={20} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className={`lg:hidden p-2 ${textColorClass} focus:outline-none focus:ring-2 focus:ring-primary rounded`} onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200"
                    >
                        <div className="container-custom py-4 px-5">
                            <nav className="flex flex-col space-y-1">
                                {navLinks.map((link) => (
                                    <NavLink key={`mobile-${link.name}`} to={link.path} onClick={closeMobileMenu} className={getMobileNavLinkClasses}>
                                        {link.name}
                                    </NavLink>
                                ))}
                                <div className="pt-4 mt-3 border-t border-gray-200 space-y-1">
                                    {/* Mobile Auth Buttons/Links */}
                                    {authStatus === 'loading' ? (
                                         <div className="flex items-center space-x-2 py-2.5 px-3 text-neutral-dark opacity-50">
                                             <Loader2 size={18} className="animate-spin" /><span>Loading...</span>
                                        </div>
                                    ) : authStatus === 'authenticated' ? (
                                        <>
                                            <Link to="/account" onClick={closeMobileMenu} className={`${getMobileNavLinkClasses({isActive: false})} flex items-center space-x-2`}>
                                                <User size={18} /><span>My Account</span>
                                            </Link>
                                            <button onClick={handleLogoutClick} className={`${getMobileNavLinkClasses({isActive: false})} flex items-center space-x-2 w-full text-left !text-red-600 hover:!text-red-700`}>
                                                <LogOut size={18} /><span>Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                         <Link to="/auth" onClick={closeMobileMenu} className={`${getMobileNavLinkClasses({isActive: false})} flex items-center space-x-2`}>
                                             <LogIn size={18} /><span>Login / Sign Up</span>
                                        </Link>
                                    )}

                                    {/* Mobile Cart Button */}
                                     <Link to="/cart" onClick={closeMobileMenu} className={`${getMobileNavLinkClasses({isActive: false})} flex items-center space-x-2 relative`}>
                                        <ShoppingCart size={18} />
                                        <span>Cart</span>
                                        {cartItemCount > 0 && (
                                            <span className="absolute left-8 top-3 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                 {cartItemCount}
                                            </span>
                                        )}
                                    </Link>
                                     {/* Mobile Search */}
                                      <button className={`${getMobileNavLinkClasses({isActive: false})} flex items-center space-x-2 w-full text-left`}>
                                         <Search size={18} /><span>Search</span>
                                      </button>
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;