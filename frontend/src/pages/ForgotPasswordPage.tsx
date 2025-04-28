// frontend/src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition'; // Assuming you have this

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Clear messages when user starts typing again
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
             setError("Please enter a valid email address.");
             return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/password/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                // No credentials needed usually for forgot password request itself
            });

            const result = await response.json();

            // Even if backend sends 200 for non-existent email, check success flag for message
            if (!response.ok && !result.success) { // Check if response NOT okay AND success is false
                 throw new Error(result.message || `Request failed (${response.status})`);
            }
             if (!result.success) { // Handle cases where backend sends 200 but success: false (though unlikely with current backend logic)
                  throw new Error(result.message || 'Failed to process request.');
             }

            // Display the success message from the backend
            setSuccessMessage(result.message || "Password reset instructions sent if the email exists.");
            setEmail(''); // Clear email field on success display

        } catch (err: any) {
            console.error("Forgot Password Error:", err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setSuccessMessage(null); // Clear success message on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-white to-secondary-light/10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                     <div className="p-6 md:p-8 border-b border-gray-200">
                        <h1 className="text-2xl font-semibold text-center text-neutral-dark font-poppins">Forgot Your Password?</h1>
                        <p className="text-sm text-gray-600 text-center mt-2">
                            Enter your email address below, and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Form Area */}
                    <div className="p-6 md:p-8">
                        {/* Display Success Message */}
                        {successMessage ? (
                             <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-start gap-3" role="alert"
                              >
                                <CheckCircle size={18} className="flex-shrink-0 mt-0.5"/>
                                <span>{successMessage}</span>
                            </motion.div>
                        ) : (
                            // Display Form
                            <form onSubmit={handleSubmit} className="space-y-5">
                                 {/* Display Error Message */}
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
                                     <label htmlFor="forgot-email" className="sr-only">Email Address</label>
                                     <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                     <input
                                        type="email"
                                        id="forgot-email"
                                        name="email"
                                        value={email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your registered email"
                                        required
                                        className="input-field pl-10"
                                        autoComplete="email"
                                        aria-invalid={!!error}
                                        aria-describedby={error ? "error-message" : undefined}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                                </button>
                            </form>
                        )}

                        {/* Back to Login Link */}
                        <div className="mt-6 text-center text-sm">
                            <Link
                                to="/auth" // Link back to the main auth page
                                className="font-medium text-primary hover:underline flex items-center justify-center gap-1"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default ForgotPasswordPage;

// Helper CSS class (ensure defined in your global CSS e.g., index.css)
/*
.input-field {
  @apply block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out;
}
.btn-primary {
  @apply bg-primary text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out;
}
*/