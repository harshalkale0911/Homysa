// frontend/src/components/account/ChangePasswordSection.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

const ChangePasswordSection: React.FC = () => {
    const initialFormState = { oldPassword: '', newPassword: '', confirmPassword: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
         // Clear messages when user starts typing again
         setError(null);
         setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // --- Frontend Validation ---
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            setError("Please fill in all password fields.");
            return;
        }
        if (formData.newPassword.length < 6) {
             setError("New password must be at least 6 characters long.");
             return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (formData.oldPassword === formData.newPassword) {
             setError("New password cannot be the same as the old password.");
             return;
        }
        // --- End Validation ---

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/password/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization header might be needed if not relying solely on cookies
                    // 'Authorization': `Bearer ${your_token_if_applicable}`
                },
                credentials: 'include', // Crucial for sending the httpOnly cookie
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    // Backend expects 'newPassword' based on controller logic
                    newPassword: formData.newPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) { // Check HTTP status code first
                 // Attempt to parse backend error message, fallback otherwise
                 throw new Error(result.message || `Password update failed (${response.status})`);
            }

            // Check the success flag from the backend response body
             if (!result.success) {
                  throw new Error(result.message || `Password update failed`);
             }

            setSuccessMessage(result.message || 'Password updated successfully!');
            setFormData(initialFormState); // Clear form on success

        } catch (err: any) {
             console.error("Password Update Error:", err);
            setError(err.message || 'An unexpected error occurred while updating password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-semibold mb-6 font-poppins text-neutral-dark">Change Password</h2>

            {/* Status Messages */}
            {/* Use AnimatePresence for smooth appearance/disappearance */}
            {successMessage && (
                 <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-center gap-2"
                    role="alert"
                  >
                    <CheckCircle size={16} /> {successMessage}
                </motion.div>
            )}
            {error && (
                 <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center gap-2"
                    role="alert"
                 >
                    <AlertCircle size={16} /> {error}
                </motion.div>
            )}


            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" id="oldPassword" name="oldPassword" value={formData.oldPassword} onChange={handleInputChange} className="input-field" required autoComplete="current-password"/>
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="input-field" required autoComplete="new-password" aria-describedby="password-hint"/>
                         <p id="password-hint" className="text-xs text-gray-500 mt-1">Must be at least 6 characters long.</p>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="input-field" required autoComplete="new-password"/>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto py-2 px-5 flex items-center justify-center gap-2 disabled:opacity-70">
                           {loading && <Loader2 className="animate-spin" size={16}/>}
                           {/* Consistent icon usage */}
                           {loading ? 'Saving...' : <><Save size={16} className="mr-1"/> Update Password</>}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default ChangePasswordSection;