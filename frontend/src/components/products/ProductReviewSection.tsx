// frontend/src/components/products/ProductReviewSection.tsx
import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, AlertCircle, CheckCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces ---
// Align with backend Product/User models
interface ReviewUser {
    _id: string;
    name: string;
    avatar?: { url: string }; // Optional avatar
}
interface ProductReview {
    _id: string;
    user: ReviewUser;
    rating: number;
    comment: string;
    createdAt: string;
}
interface ProductReviewSectionProps {
    productId: string;
    initialReviews: ProductReview[];
    productName: string; // For context in headings
    // Optional: Callback to refresh reviews in parent after submission
    // onReviewSubmit?: () => void;
}

// --- Placeholder Auth Hook ---
// Replace with your actual auth context/hook implementation
const useAuth = () => {
    // Simulate fetching auth status and user data
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for testing form
    const [user, setUser] = useState<{ _id: string; name: string } | null>({ _id: 'mockUserId123', name: 'Test User' }); // Mock user
    const [loading, setLoading] = useState(false); // Simulate auth check loading

    // useEffect(() => { /* ... actual auth check logic ... */ }, []);

    return { isAuthenticated, user, loading };
};
// --- End Placeholder ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Helper to format date
const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
    productId,
    initialReviews,
    productName,
    // onReviewSubmit // Uncomment if using callback
}) => {
    const { isAuthenticated, user, loading: authLoading } = useAuth(); // Use your auth hook
    const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
    const [showReviewForm, setShowReviewForm] = useState(false); // Initially hidden? Or always show if logged in?
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [userComment, setUserComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState<string>('');
    const [currentUserReview, setCurrentUserReview] = useState<ProductReview | null>(null);

    // Find user's existing review and pre-fill form
    useEffect(() => {
        if (user && reviews.length > 0) {
            const existing = reviews.find(r => r.user?._id === user._id);
            if (existing) {
                setCurrentUserReview(existing);
                setUserRating(existing.rating);
                setUserComment(existing.comment);
                setShowReviewForm(true); // Show form if user already reviewed
            } else {
                // Reset form if user logs out or review list changes without their review
                setCurrentUserReview(null);
                setUserRating(0);
                setUserComment('');
                // Decide if form should hide/show based on login status only
                setShowReviewForm(isAuthenticated);
            }
        } else {
             // Show form only if authenticated and no existing review found initially
             setShowReviewForm(isAuthenticated && !currentUserReview);
        }
        // Update displayed reviews if initialReviews prop changes
        setReviews(initialReviews);

    }, [initialReviews, user, isAuthenticated]); // Rerun when auth or reviews change


    const handleRatingClick = (ratingValue: number) => {
        setUserRating(ratingValue);
        setSubmitStatus('idle'); // Clear status on interaction
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserComment(e.target.value);
         setSubmitStatus('idle'); // Clear status on interaction
    };

    const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isAuthenticated || !user) {
            setSubmitMessage("Please login to submit a review.");
            setSubmitStatus('error');
            return;
        }
        if (userRating === 0) {
            setSubmitMessage("Please select a rating (1-5 stars).");
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Send auth cookie
                body: JSON.stringify({
                    productId: productId,
                    rating: userRating,
                    comment: userComment,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || `Failed to submit review (${response.status})`);
            }

            setSubmitStatus('success');
            setSubmitMessage(result.message || 'Review submitted successfully!');
            // Optimistic UI update (optional but good UX)
            const newReviewData = {
                _id: currentUserReview?._id || `temp-${Date.now()}`, // Use existing ID or temp
                user: { _id: user._id, name: user.name, avatar: undefined }, // Use current user data
                rating: userRating,
                comment: userComment,
                createdAt: new Date().toISOString(),
            };
             if (currentUserReview) {
                 // Update existing review in state
                 setReviews(prev => prev.map(r => r.user._id === user._id ? newReviewData : r));
             } else {
                 // Add new review to state
                 setReviews(prev => [newReviewData, ...prev.filter(r => r.user._id !== user._id)]);
             }
             setCurrentUserReview(newReviewData); // Update the current user review state


            // Or trigger a refetch in the parent component:
            // if (onReviewSubmit) {
            //     onReviewSubmit();
            // }

             // Optionally hide form after successful submission?
            // setShowReviewForm(false);


        } catch (err: any) {
            console.error("Review Submission Error:", err);
            setSubmitStatus('error');
            setSubmitMessage(err.message || "An error occurred while submitting your review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render ---
    return (
        <div className="space-y-10">
            {/* --- Review Submission Form --- */}
            {authLoading ? (
                 <div className="text-center p-4 text-gray-500">Loading user status...</div>
             ) : isAuthenticated ? (
                 // Show form if authenticated AND (always shown OR explicitly toggled)
                 // OR always show form if user has already reviewed
                 currentUserReview || showReviewForm ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg md:text-xl font-semibold mb-4 font-poppins text-neutral-dark">
                            {currentUserReview ? `Update Your Review for ${productName}` : `Write a Review for ${productName}`}
                        </h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Rating Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating*</label>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => handleRatingClick(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className={`focus:outline-none transition-colors duration-150 ${
                                                (hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                                            }`}
                                            aria-label={`Rate ${star} out of 5 stars`}
                                            aria-pressed={userRating === star}
                                        >
                                            <Star size={24} fill={(hoverRating || userRating) >= star ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                     {userRating > 0 && <span className="text-sm font-medium text-gray-600 ml-2">({userRating}/5)</span>}
                                </div>
                            </div>

                            {/* Comment Textarea */}
                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review <span className="text-gray-400">(Optional)</span></label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows={4}
                                    value={userComment}
                                    onChange={handleCommentChange}
                                    placeholder={`Share your thoughts on the ${productName}...`}
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Status Messages */}
                             <AnimatePresence>
                                {submitStatus === 'error' && submitMessage && (
                                     <motion.p initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-sm text-red-600 flex items-center gap-1" role="alert"><AlertCircle size={16}/> {submitMessage}</motion.p>
                                )}
                                {submitStatus === 'success' && submitMessage && (
                                     <motion.p initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-sm text-green-600 flex items-center gap-1" role="status"><CheckCircle size={16}/> {submitMessage}</motion.p>
                                )}
                             </AnimatePresence>


                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || userRating === 0}
                                    className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                                    {isSubmitting ? 'Submitting...' : (currentUserReview ? 'Update Review' : 'Submit Review')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                 ) : (
                      // Button to show form if not already reviewed and logged in
                     <button onClick={() => setShowReviewForm(true)} className="btn-outline text-sm">Write a Review</button>
                 )
             ) : (
                 // Prompt to login
                 <div className="text-center p-4 border rounded-md bg-gray-50 text-sm text-gray-600">
                     Please <Link to="/auth" className="text-primary font-medium hover:underline">login</Link> to write a review.
                 </div>
             )}


            {/* --- Review List --- */}
            <div className="mt-8">
                 <h3 className="text-lg md:text-xl font-semibold mb-6 font-poppins text-neutral-dark border-b pb-2">
                    {reviews.length > 0 ? `Reviews (${reviews.length})` : 'No Reviews Yet'}
                 </h3>
                {reviews.length > 0 ? (
                    <div className="space-y-6 divide-y divide-gray-100">
                        {reviews.map(review => (
                            <motion.div
                                key={review._id} // Use review ID as key
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="pt-6 first:pt-0"
                            >
                               <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                         {review.user?.avatar?.url ? (
                                            <img src={review.user.avatar.url} alt={review.user.name} className="w-full h-full object-cover"/>
                                        ) : (
                                             <span className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-medium">
                                                 {review.user?.name ? review.user.name.charAt(0).toUpperCase() : <User size={20}/>}
                                             </span>
                                         )}
                                    </div>
                                    {/* Review Content */}
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                                            <p className="font-semibold text-sm text-neutral-dark">{review.user?.name || 'Anonymous'}</p>
                                             <p className="text-xs text-gray-500 mt-1 sm:mt-0">{formatDate(review.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star key={i} size={15} className={`mr-0.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}/>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
                                            {review.comment || <span className="italic text-gray-500">No comment provided.</span>}
                                        </p>
                                         {/* Optional: Add delete button for admin/owner */}
                                         {/* {user && (user.role === 'admin' || user._id === review.user?._id) && (
                                            <button className="text-xs text-red-500 hover:underline mt-2">Delete</button>
                                         )} */}
                                    </div>
                               </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">
                         {isAuthenticated ? 'Be the first to review this product!' : 'No reviews yet for this product.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductReviewSection;