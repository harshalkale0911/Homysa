// frontend/src/pages/AuthPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// --- Placeholder Auth Hook ---
// Replace with your actual auth context/hook
const useAuth = () => {
     // Simulate login state update (replace with context dispatch/setter)
     const login = (user: any) => {
         console.log("Simulating context login:", user);
         // Example: dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
     };
     // Simulate auth status check (replace with context value)
     const isAuthenticated = false; // Example value
     return { login, isAuthenticated };
};
// --- End Placeholder ---


const AuthPage: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    const navigate = useNavigate();
    const location = useLocation();
    const { login: contextLogin, isAuthenticated } = useAuth(); // Get context login function

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
             // Redirect to the page the user intended to visit, or home
             const from = location.state?.from?.pathname || '/';
             navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location.state]);


    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError(null); // Clear errors on mode switch
        // Reset form fields on toggle for clarity
        setLoginData({ email: '', password: '' });
        setSignupData({ name: '', email: '', password: '', confirmPassword:'' });
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        setError(null); // Clear error on input change
    };

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
         setError(null); // Clear error on input change
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
                credentials: 'include', // Important for cookies
            });
            const result = await response.json();

            if (!response.ok) { // Check HTTP status first
                // Use the message from the backend response if available
                throw new Error(result.message || `Login failed (${response.status})`);
            }
            // No need to check result.success here if !response.ok catches it

            console.log('Login successful:', result.user);
            contextLogin(result.user); // Update global auth state

            // Redirect after successful login
            const from = location.state?.from?.pathname || '/'; // Redirect back or to home
            navigate(from, { replace: true });

        } catch (err: any) {
            console.error("Login Error:", err);
            // Display the error message received from the backend or a generic one
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Frontend validation
        if (signupData.password !== signupData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (signupData.password.length < 6) {
             setError("Password must be at least 6 characters long.");
             return;
        }
        if (!signupData.name.trim() || !signupData.email.trim()) {
             setError("Name and Email cannot be empty.");
             return;
        }
        if (!/\S+@\S+\.\S+/.test(signupData.email)) {
             setError("Please enter a valid email address.");
             return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupData.name.trim(), // Trim whitespace
                    email: signupData.email.trim(),
                    password: signupData.password,
                }),
                 credentials: 'include', // If registration logs in & sets cookie
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Signup failed (${response.status})`);
            }
            // No need to check result.success if !response.ok catches it

            console.log('Signup successful:', result.user);
            contextLogin(result.user); // Update global auth state

             // Redirect after successful signup
             const from = location.state?.from?.pathname || '/';
             navigate(from, { replace: true });

        } catch (err: any) {
            console.error("Signup Error:", err);
            setError(err.message || 'An unexpected error occurred during signup.');
        } finally {
            setLoading(false);
        }
    };

    // Animation variants for form switching
    const formVariants = {
        hidden: { opacity: 0, x: isLoginMode ? -30 : 30, transition: { duration: 0.3 } },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: isLoginMode ? 30 : -30, transition: { duration: 0.3, ease: "easeIn" } },
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-white to-secondary-light/10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                    {/* Header Area */}
                    <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-center">
                         <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-white rounded">
                            <h1 className="text-3xl font-bold font-poppins text-white tracking-wide">HOMYSA</h1>
                         </Link>
                    </div>

                    {/* Form Area */}
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait" initial={false}> {/* Ensures one form exits before the next enters */}
                            {isLoginMode ? (
                                // --- Login Form ---
                                <motion.div
                                    key="login"
                                    variants={formVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <h2 className="text-2xl font-semibold text-center text-neutral-dark mb-6 font-poppins">Welcome Back!</h2>
                                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                                         {/* Error Message Display */}
                                         {error && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-sm text-red-700 bg-red-100 p-3 rounded-md flex items-center gap-2 border border-red-200"
                                                role="alert"
                                            >
                                                <AlertCircle size={16} /> <span>{error}</span>
                                            </motion.div>
                                        )}
                                        {/* Email Input */}
                                        <div className="relative">
                                             <label htmlFor="login-email" className="sr-only">Email</label>
                                             <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                             <input
                                                type="email" id="login-email" name="email" value={loginData.email} onChange={handleLoginChange}
                                                placeholder="Email Address" required className="input-field pl-10" autoComplete="email" aria-invalid={!!error}
                                            />
                                        </div>
                                        {/* Password Input */}
                                        <div className="relative">
                                             <label htmlFor="login-password" className="sr-only">Password</label>
                                             <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                            <input
                                                type="password" id="login-password" name="password" value={loginData.password} onChange={handleLoginChange}
                                                placeholder="Password" required className="input-field pl-10" autoComplete="current-password" aria-invalid={!!error}
                                            />
                                        </div>
                                        {/* Submit Button */}
                                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={18} />}
                                            {loading ? 'Signing In...' : 'Sign In'}
                                        </button>
                                        {/* Forgot Password Link */}
                                        <div className="text-center text-sm">
                                             <Link to="/password/forgot" className="font-medium text-primary hover:underline focus:outline-none focus:underline">Forgot Password?</Link>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                // --- Signup Form ---
                                <motion.div
                                    key="signup"
                                    variants={formVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <h2 className="text-2xl font-semibold text-center text-neutral-dark mb-6 font-poppins">Create Your Account</h2>
                                    <form onSubmit={handleSignupSubmit} className="space-y-5">
                                         {/* Error Message Display */}
                                          {error && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-sm text-red-700 bg-red-100 p-3 rounded-md flex items-center gap-2 border border-red-200"
                                                role="alert"
                                            >
                                                <AlertCircle size={16} /> <span>{error}</span>
                                            </motion.div>
                                        )}
                                        {/* Name Input */}
                                        <div className="relative">
                                            <label htmlFor="signup-name" className="sr-only">Full Name</label>
                                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                            <input type="text" id="signup-name" name="name" value={signupData.name} onChange={handleSignupChange} placeholder="Full Name" required className="input-field pl-10" autoComplete="name" aria-invalid={!!error}/>
                                        </div>
                                        {/* Email Input */}
                                        <div className="relative">
                                             <label htmlFor="signup-email" className="sr-only">Email</label>
                                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                            <input type="email" id="signup-email" name="email" value={signupData.email} onChange={handleSignupChange} placeholder="Email Address" required className="input-field pl-10" autoComplete="email" aria-invalid={!!error}/>
                                        </div>
                                        {/* Password Input */}
                                        <div className="relative">
                                             <label htmlFor="signup-password" className="sr-only">Password</label>
                                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                            <input type="password" id="signup-password" name="password" value={signupData.password} onChange={handleSignupChange} placeholder="Password (min 6 chars)" required className="input-field pl-10" autoComplete="new-password" aria-invalid={!!error}/>
                                        </div>
                                        {/* Confirm Password Input */}
                                        <div className="relative">
                                             <label htmlFor="signup-confirmPassword" className="sr-only">Confirm Password</label>
                                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                            <input type="password" id="signup-confirmPassword" name="confirmPassword" value={signupData.confirmPassword} onChange={handleSignupChange} placeholder="Confirm Password" required className="input-field pl-10" autoComplete="new-password" aria-invalid={!!error}/>
                                        </div>
                                        {/* Submit Button */}
                                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                                             {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={18} />}
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Toggle Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm">
                            <p className="text-gray-600">
                                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                                <button onClick={toggleMode} className="font-medium text-primary hover:underline ml-1 focus:outline-none focus:underline">
                                    {isLoginMode ? 'Sign Up Now' : 'Sign In Instead'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default AuthPage;