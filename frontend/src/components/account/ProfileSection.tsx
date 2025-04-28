// frontend/src/components/account/ProfileSection.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit, Save, XCircle, Loader2, AlertCircle, CheckCircle, Calendar } from 'lucide-react'; // Added Calendar

// Interface for User data (Align with backend User model, exclude sensitive fields)
interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin'; // Use specific roles
    createdAt: string; // Date as string from JSON
    avatar?: { url: string; public_id?: string }; // Include public_id if needed for deletion
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

const ProfileSection: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    // Separate form state from displayed user state
    const [formData, setFormData] = useState<{ name: string; email: string }>({ name: '', email: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true); // Loading profile data
    const [saving, setSaving] = useState(false); // Saving changes
    const [error, setError] = useState<string | null>(null); // General or fetch error
    const [saveError, setSaveError] = useState<string | null>(null); // Error specific to saving
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch user profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                const response = await fetch(`${API_BASE_URL}/me`, {
                    credentials: 'include', // Important to send cookies for authentication
                });

                if (!response.ok) {
                    if (response.status === 401) throw new Error('Unauthorized. Please log in.');
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch profile data (${response.status})`);
                }

                const data = await response.json();
                if (!data.success || !data.user) {
                    throw new Error(data.message || 'Could not load profile data.');
                }
                setUser(data.user);
                // Initialize form data only after user data is fetched successfully
                setFormData({ name: data.user.name, email: data.user.email });

            } catch (err: any) {
                console.error("Fetch Profile Error:", err);
                setError(err.message || 'An error occurred while loading your profile.');
                setUser(null); // Ensure user is null on error
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []); // Empty dependency array means fetch only on mount

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
         // Clear save-related messages when typing
         setSaveError(null);
         setSuccessMessage(null);
    };

    const handleEditToggle = () => {
        if (isEditing && user) {
            // Reset form data to match current user state if cancelling edit
            setFormData({ name: user.name, email: user.email });
        }
        setIsEditing(!isEditing);
        // Clear messages when toggling edit mode
        setSaveError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setSaveError(null);
        setSuccessMessage(null);

         // Frontend validation (optional, as backend validates too)
        if (!formData.name.trim() || !formData.email.trim()) {
            setSaveError("Name and Email cannot be empty.");
            setSaving(false);
            return;
        }
        // Basic email format check
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
             setSaveError("Please enter a valid email address.");
             setSaving(false);
             return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/me/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if needed
                },
                credentials: 'include', // Send cookies
                body: JSON.stringify(formData), // Send only name and email for now
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Failed to update profile (${response.status})`);
            }
             if (!result.success) {
                throw new Error(result.message || 'Failed to update profile.');
            }


            setUser(result.user); // Update local user state with the response
            setFormData({ name: result.user.name, email: result.user.email }); // Sync form state
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false); // Exit editing mode

        } catch (err: any) {
            console.error("Save Profile Error:", err);
            setSaveError(err.message || 'An error occurred while saving your profile.');
        } finally {
            setSaving(false);
        }
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10 min-h-[200px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) { // Show general fetch error prominently
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-3" role="alert">
                <AlertCircle className="inline flex-shrink-0" size={20} />
                 <div>
                     <p className="font-medium">Error loading profile:</p>
                     <p>{error}</p>
                 </div>
            </div>
        );
    }
    if (!user) {
        // This case should ideally be covered by the error state after fetch fails
        return <div className="p-6 text-gray-500">Could not load user profile. Please try logging in again.</div>;
    }

    // Helper to format date
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return 'N/A';
        }
    };


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold font-poppins text-neutral-dark">My Profile</h2>
                {/* Edit/Cancel Buttons */}
                <button
                    onClick={handleEditToggle}
                    className={`btn text-sm ${isEditing ? 'btn-outline-secondary' : 'btn-outline-primary'} py-1.5 px-4 rounded-md`} // Added rounded-md
                >
                    {isEditing ? <><XCircle size={16} className="mr-1"/> Cancel</> : <><Edit size={16} className="mr-1"/> Edit Profile</>}
                </button>
            </div>

            {/* Status Messages for Save Operation */}
            {successMessage && (
                <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-center gap-2" role="alert">
                   <CheckCircle size={16} /> {successMessage}
                </motion.div>
            )}
             {saveError && ( // Show save-specific error
                <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center gap-2" role="alert">
                    <AlertCircle size={16} /> {saveError}
                </motion.div>
            )}

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
                 <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
                     {/* Avatar Display & Action */}
                     <div className="flex items-center space-x-5">
                        <img
                            src={user.avatar?.url || '/default-avatar.png'} // Use placeholder if no avatar URL
                            alt="User Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" // Slightly larger, added shadow
                        />
                        {/* Avatar upload button (optional, enable when implemented) */}
                         {/* {isEditing && (
                           <button type="button" className="text-sm text-primary hover:underline focus:outline-none">
                               Change Avatar
                               <input type="file" className="hidden" accept="image/*" />
                            </button>
                        )} */}
                    </div>

                     {/* Form Fields Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Name Field */}
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            {isEditing ? (
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="input-field" required />
                            ) : (
                                <p className="text-gray-800 mt-1 text-base bg-gray-50 px-3 py-2 rounded-md border border-gray-200">{user.name}</p> // Display look
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                             {isEditing ? (
                                 <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" required />
                             ) : (
                                 <p className="text-gray-800 mt-1 text-base bg-gray-50 px-3 py-2 rounded-md border border-gray-200">{user.email}</p> // Display look
                             )}
                        </div>

                         {/* Role Display (Read-only) */}
                         <div>
                             <p className="text-sm font-medium text-gray-700 mb-1">Role</p>
                             <p className="text-gray-800 mt-1 text-base capitalize bg-gray-50 px-3 py-2 rounded-md border border-gray-200 inline-block">
                                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                     {user.role}
                                 </span>
                             </p>
                         </div>

                         {/* Joined Date Display (Read-only) */}
                         <div>
                             <p className="text-sm font-medium text-gray-700 mb-1">Member Since</p>
                             <p className="text-gray-800 mt-1 text-base bg-gray-50 px-3 py-2 rounded-md border border-gray-200 flex items-center gap-2">
                                 <Calendar size={16} className="text-gray-500"/>
                                 {formatDate(user.createdAt)}
                             </p>
                         </div>
                    </div>


                    {/* Save Button (Visible only when editing) */}
                    {isEditing && (
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={saving} className="btn-primary py-2 px-6 flex items-center gap-2 disabled:opacity-70">
                                {saving && <Loader2 className="animate-spin" size={16}/>}
                                {saving ? 'Saving...' : <><Save size={16} className="mr-1"/> Save Changes</>}
                            </button>
                        </div>
                    )}
                 </form>
            </div>
        </motion.div>
    );
};

export default ProfileSection;