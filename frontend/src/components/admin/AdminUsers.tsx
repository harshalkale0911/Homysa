// frontend/src/components/admin/AdminUsers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit, Trash2, Loader2, AlertCircle, UserCheck, UserX, ShieldCheck, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { Link } from 'react-router-dom'; // If linking to user detail page

const API_BASE_URL = import.meta.env.VITE_API_ADMIN_BASE_URL || 'http://localhost:5000/api/v1/admin'; // Use env var

// Interface for User data from admin perspective
interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
    avatar?: { url: string };
    // Add other fields if needed, e.g., order count, last login
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // Track loading for delete/role change per user
    // Add state for pagination, search, etc. later

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
             console.log("Fetching admin users...");
             const response = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' }); // Add pagination params later
             if (!response.ok) {
                 const errData = await response.json().catch(() => ({}));
                 throw new Error(errData.message || `Failed to fetch users (${response.status})`);
             }
             const data = await response.json();
             if (!data.success) throw new Error(data.message || 'API error fetching users');
             setUsers(data.users || []);
             // Set pagination state if applicable

        } catch (err: any) {
            setError(err.message || 'Failed to load users.');
            setUsers([]); // Clear on error
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array, fetch on mount or refresh

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

     const handleDeleteUser = async (userId: string, userName: string) => {
        // More specific confirmation
        if (!window.confirm(`DELETE USER?\n\nName: ${userName}\nID: ${userId}\n\nThis action is IRREVERSIBLE. Are you absolutely sure?`)) {
            return;
        }
        setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: true }));
        setError(null);

        try {
             const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
                 method: 'DELETE',
                 credentials: 'include',
             });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to delete user.');
            }
            setUsers(prev => prev.filter(u => u._id !== userId)); // Update state on success
             console.log(`User ${userName} deleted successfully.`);
             // Optional: Success toast

        } catch(err: any) {
            console.error(`Delete user error for ${userId}:`, err);
            setError(`Failed to delete user "${userName}": ${err.message}`);
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: false }));
        }
    };

     const handleChangeRole = async (userId: string, userName: string, currentRole: 'user' | 'admin') => {
         const newRole = currentRole === 'admin' ? 'user' : 'admin';
         // Confirmation with clearer action
         if (!window.confirm(`Change role for user "${userName}" from '${currentRole}' to '${newRole}'?`)) {
             return;
         }
        setActionLoading(prev => ({ ...prev, [`role-${userId}`]: true }));
        setError(null);

         try {
             const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 credentials: 'include',
                 body: JSON.stringify({ role: newRole }) // Only send the role field
             });
             const result = await response.json();
             if (!response.ok || !result.success) {
                 throw new Error(result.message || 'Failed to update role.');
             }
             // Update local state on success
             setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
             console.log(`User ${userName}'s role updated to ${newRole}.`);
             // Optional: Success toast

        } catch(err: any) {
            console.error(`Change role error for ${userId}:`, err);
            setError(`Failed to update role for "${userName}": ${err.message}`);
        } finally {
             setActionLoading(prev => ({ ...prev, [`role-${userId}`]: false }));
        }
    };


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold font-poppins text-neutral-dark">Manage Users</h1>
                 <div className="flex items-center gap-2">
                     {/* <button className="btn-primary text-sm">Add New User</button> */}
                    <button onClick={fetchUsers} disabled={loading} className="btn-icon btn-outline-secondary text-sm p-1.5 disabled:opacity-50" title="Refresh Users">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                 </div>
                 {/* Add search/filter controls here later */}
            </div>

            {/* Global Error Message */}
             {error && (
                 <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 flex items-center gap-2" role="alert">
                     <AlertCircle size={20}/> {error}
                 </div>
             )}

            {loading && users.length === 0 && ( // Initial loading
                 <div className="flex justify-center items-center py-10 min-h-[300px]">
                     <Loader2 className="animate-spin text-primary" size={32} />
                 </div>
            )}

            {!loading && users.length === 0 && !error && ( // Empty state
                 <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
                     <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No users found.</p>
                </div>
            )}

            {users.length > 0 && ( // Render table only if users exist
                <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Table Headers */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => {
                                const isDeleting = actionLoading[`delete-${user._id}`];
                                const isChangingRole = actionLoading[`role-${user._id}`];
                                const isLoadingAction = isDeleting || isChangingRole;
                                return (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={isLoadingAction ? 'opacity-50 bg-gray-50' : ''}
                                    >
                                        {/* User Info Cell */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover border bg-gray-200"
                                                        src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`} // Fallback avatar generator
                                                        alt={`${user.name}'s avatar`}
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="ml-4 min-w-0"> {/* Allow text truncation */}
                                                    <div className="text-sm font-medium text-gray-900 truncate" title={user.name}>{user.name}</div>
                                                    <div className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Role Cell */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        {/* Joined Date Cell */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        {/* Actions Cell */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {/* TODO: Add View/Edit User Details Link/Modal */}
                                             {/* <button title="Edit User" disabled={isLoadingAction} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"><Edit size={16}/></button> */}

                                             {/* Role Toggle Button */}
                                             <button
                                                 onClick={() => handleChangeRole(user._id, user.name, user.role)}
                                                 title={user.role === 'admin' ? `Demote ${user.name} to User` : `Promote ${user.name} to Admin`}
                                                 disabled={isLoadingAction} // Disable while any action is loading for this user
                                                 className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${user.role === 'admin' ? 'text-green-600 hover:text-green-800' : 'text-indigo-600 hover:text-indigo-800'}`}
                                                 aria-label={user.role === 'admin' ? `Demote ${user.name} to User` : `Promote ${user.name} to Admin`}
                                            >
                                                 {isChangingRole ? <Loader2 size={16} className="animate-spin"/> : (user.role === 'admin' ? <UserX size={16} /> : <ShieldCheck size={16} />)}
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                title={`Delete user ${user.name}`}
                                                disabled={isLoadingAction}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label={`Delete user ${user.name}`}
                                            >
                                                {isDeleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {/* TODO: Add Pagination controls here */}
                </div>
            )}

        </motion.div>
    );
};

export default AdminUsers;