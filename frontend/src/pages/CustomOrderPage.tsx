// frontend/src/pages/CustomOrderPage.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, X, AlertCircle, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react'; // Added icons
import PageTransition from '../components/ui/PageTransition';
import SectionTitle from '../components/ui/SectionTitle';

// --- Interfaces ---
interface CustomCategory { id: string; name: string; description: string; image: string; }
interface FormData {
    name: string; email: string; phone: string; category: string; description: string;
    budget: string; dimensions: string; woodType: string; timeframe: string;
    // Files are handled separately using FormData API
}
interface ApiResponse { success: boolean; message: string; customOrder?: { _id: string; }; } // Align with backend response

// --- Data ---
const customCategories: CustomCategory[] = [
    { id: 'Tables', name: 'Tables', description: 'Custom dining tables, coffee tables, side tables...', image: 'https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'Chairs', name: 'Chairs & Seating', description: 'Ergonomic chairs, dining chairs, sofas...', image: 'https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'Storage', name: 'Storage Solutions', description: 'Cabinets, bookshelves, sideboards...', image: 'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'Beds', name: 'Beds & Bedroom', description: 'Bed frames, nightstands, dressers...', image: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'Other', name: 'Other Furniture', description: 'Let us know what you have in mind!', image: 'https://images.pexels.com/photos/6267516/pexels-photo-6267516.jpeg?auto=compress&cs=tinysrgb&w=600' } // Added 'Other'
];
const woodOptions: string[] = ['Teak', 'Sheesham', 'Mango Wood', 'Oak', 'Walnut', 'Maple', 'Pine', 'Other', 'Not Sure'];
const timeframeOptions: string[] = ['1-2 months', '3-4 months', '5-6 months', 'Flexible', 'Urgent', 'Not Specified']; // Added Not Specified

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Use env var

// --- Component ---
const CustomOrderPage: React.FC = () => {
    const initialFormData: FormData = {
        name: '', email: '', phone: '', category: '', description: '', budget: '', dimensions: '', woodType: '', timeframe: '',
    };
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---
    const handleCategorySelect = (category: CustomCategory) => {
        setFormData((prev) => ({ ...prev, category: category.name })); // Store category name
        setFormStep(2);
        window.scrollTo(0, 0); // Scroll to top on step change
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
         setFormStatus('idle'); // Clear status on input change
         setSubmitMessage('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Validate file types and size here if needed
            const validFiles = newFiles.filter(file =>
                ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type) && file.size <= 5 * 1024 * 1024 // 5MB limit
            );
            // Combine and limit total number of files
            const combinedFiles = [...uploadedFiles, ...validFiles].slice(0, 5); // Limit to 5 files
            setUploadedFiles(combinedFiles);

             if (validFiles.length !== newFiles.length) {
                 setSubmitMessage("Some files were not added (invalid type or >5MB). Max 5 files.");
                 setFormStatus('error'); // Show as an error temporarily
             } else {
                 setSubmitMessage('');
                 setFormStatus('idle');
             }
        }
        // Reset file input to allow selecting the same file again after removal
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (indexToRemove: number) => {
        setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handlePrevStep = () => {
        setFormStep((prev) => Math.max(1, prev - 1));
        window.scrollTo(0, 0);
    };
    const handleNextStep = () => {
        // Add validation before proceeding? Optional.
        setFormStep((prev) => Math.min(3, prev + 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('submitting');
        setSubmitMessage('');

        const submissionData = new FormData(); // Use FormData for file upload compatibility

        // Append text fields
        Object.entries(formData).forEach(([key, value]) => {
            submissionData.append(key, value);
        });

        // Append files (backend expects 'referenceImages' field)
        uploadedFiles.forEach((file) => {
            submissionData.append('referenceImages', file, file.name);
        });

        try {
             console.log('Submitting custom order...');
            const response = await fetch(`${API_BASE_URL}/custom-order/new`, {
                method: 'POST',
                body: submissionData,
                // No 'Content-Type' header needed for FormData
                // Add credentials: 'include' if auth is required
            });

            const result: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Submission failed (${response.status})`);
            }
             if (!result.success) {
                 throw new Error(result.message || 'Submission failed. Please review your details.');
             }

            setFormStatus('success');
            setSubmitMessage(result.message || 'Request submitted successfully! We will contact you soon.');
            setFormData(initialFormData);
            setUploadedFiles([]);
            // setFormStep(1); // Or keep showing success message

        } catch (error: any) {
            console.error('Custom order submission error:', error);
            setFormStatus('error');
            setSubmitMessage(error.message || 'An error occurred. Please try again later.');
        }
        // No finally block resetting status, let it stay success/error until user interaction
    };

    // --- Render ---
    return (
        <PageTransition>
            {/* Hero Section */}
            <section className="relative py-36 px-6 bg-neutral-dark isolate">
                 <div className="absolute inset-0 opacity-15 z-[-1]"> <img src="https://images.pexels.com/photos/6267516/pexels-photo-6267516.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Bespoke Furniture Crafting" className="w-full h-full object-cover" loading="lazy"/> </div>
                 <div className="container-custom text-center z-10 relative">
                     <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4"> Bespoke Furniture Orders </motion.h1>
                     <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto"> Let our artisans craft a unique piece perfectly tailored to your vision and space. </motion.p>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-secondary-light">
                 <div className="container-custom">
                     <SectionTitle subtitle="Our Process" title="How Custom Orders Work" className="text-neutral-dark" subtitleClassName="text-primary"/>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                         {[ { title: 'Submit Request', desc: 'Fill out the form below with your ideas and requirements.' }, { title: 'Consultation', desc: 'Our design team contacts you to discuss details and provide an initial quote.' }, { title: 'Design & Approval', desc: 'We finalize the design and provide detailed plans for your approval.' }, { title: 'Crafting & Delivery', desc: 'Your bespoke piece is handcrafted and delivered with care.' } ].map((step, index) => (
                             <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="text-center p-4">
                                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4 border-2 border-primary/20 shadow-sm">{index + 1}</div>
                                <h3 className="text-lg font-poppins font-semibold mb-2 text-neutral-dark">{step.title}</h3>
                                <p className="text-gray-600 text-sm">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Custom Order Form Section */}
            <section className="py-20">
                <div className="container-custom max-w-4xl">
                    <SectionTitle subtitle="Get Started" title="Create Your Custom Piece" className="text-neutral-dark" subtitleClassName="text-primary"/>

                    {formStatus === 'success' ? (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-300 rounded-lg shadow-lg p-8 text-center">
                             <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                             <h3 className="text-2xl font-poppins font-semibold text-green-800 mb-4">Request Submitted Successfully!</h3>
                             <p className="text-green-700 mb-6">{submitMessage}</p>
                             <p className="text-gray-600 font-medium text-sm">We aim to respond within 1-2 business days.</p>
                             <button onClick={() => { setFormStatus('idle'); setFormStep(1); }} className="mt-6 btn-outline text-sm">Submit Another Request</button>
                        </motion.div>
                    ) : (
                         <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                            {/* Progress Indicator */}
                             <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                 <div className="flex items-center justify-between max-w-lg mx-auto">
                                    {['Category', 'Details', 'Contact'].map((label, index) => (
                                         <React.Fragment key={label}>
                                            <div className={`flex flex-col items-center transition-colors duration-300 ${formStep >= index + 1 ? 'text-primary' : 'text-gray-400'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium ${formStep >= index + 1 ? 'bg-primary text-white border-primary' : 'bg-gray-200 text-gray-500 border-gray-300'} transition-all duration-300`}>
                                                    {formStep > index + 1 ? <CheckCircle size={16}/> : index + 1}
                                                </div>
                                                <span className="text-xs mt-1.5 font-medium">{label}</span>
                                            </div>
                                            {index < 2 && <div className={`flex-grow border-t-2 mx-2 mt-4 ${formStep > index + 1 ? 'border-primary' : 'border-gray-300'} transition-colors duration-300`}></div>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Form Content */}
                             <AnimatePresence mode="wait">
                                <motion.form
                                    key={formStep} // Animate when step changes
                                    initial={{ opacity: 0, x: formStep > 1 ? 20 : -20 }} // Slide in based on direction
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: formStep < 3 ? -20 : 20 }} // Slide out based on direction
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    onSubmit={handleSubmit} className="p-6 md:p-10"
                                >
                                     {/* Global Status Message Area */}
                                    {formStatus === 'error' && submitMessage && (
                                        <div className="mb-6 text-sm text-red-700 bg-red-100 p-3 rounded-md flex items-center gap-2 border border-red-200" role="alert">
                                            <AlertCircle size={16} /> <span>{submitMessage}</span>
                                        </div>
                                    )}
                                    {formStep === 1 && (
                                         <div>
                                            <h3 className="text-xl font-poppins font-semibold mb-6 text-center text-neutral-dark">1. What type of furniture are you looking for?</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {customCategories.map((category) => (
                                                    <button type="button" key={category.id} onClick={() => handleCategorySelect(category)}
                                                        className={`group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${formData.category === category.name ? 'border-primary shadow-lg ring-2 ring-primary/50' : 'border-gray-200' }`} >
                                                        <div className="relative h-40"> <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /> <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4"> <h4 className="text-white text-lg font-poppins font-semibold">{category.name}</h4> </div> </div>
                                                        {/* <div className="p-3 bg-white text-left"> <p className="text-gray-600 text-xs">{category.description}</p> </div> */}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {formStep === 2 && (
                                         <div className="max-w-3xl mx-auto">
                                            <h3 className="text-xl font-poppins font-semibold mb-8 text-center text-neutral-dark">2. Tell Us About Your Custom Furniture</h3>
                                            <div className="space-y-5">
                                                 {/* Description, Dimensions, Budget, Wood, Timeframe */}
                                                 <div><label htmlFor="description" className="form-label">Description*</label><textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the piece, style, features, etc." className="input-field h-32 resize-none" required></textarea></div>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> <div><label htmlFor="dimensions" className="form-label">Dimensions (Approx.)</label><input type="text" id="dimensions" name="dimensions" value={formData.dimensions} onChange={handleInputChange} placeholder="e.g., 120cm L x 80cm W x 75cm H" className="input-field"/></div> <div><label htmlFor="budget" className="form-label">Estimated Budget (₹)</label><input type="text" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} placeholder="e.g., 30,000 - 40,000" className="input-field"/></div> </div>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> <div><label htmlFor="woodType" className="form-label">Preferred Wood Type</label><select id="woodType" name="woodType" value={formData.woodType} onChange={handleInputChange} className="input-field"><option value="">Select wood (optional)</option>{woodOptions.map(w => (<option key={w} value={w}>{w}</option>))}</select></div> <div><label htmlFor="timeframe" className="form-label">Desired Timeframe</label><select id="timeframe" name="timeframe" value={formData.timeframe} onChange={handleInputChange} className="input-field"><option value="">Select timeframe (optional)</option>{timeframeOptions.map(t => (<option key={t} value={t}>{t}</option>))}</select></div> </div>
                                                 {/* File Upload */}
                                                 <div>
                                                     <label className="form-label">Reference Images/Sketches (Optional, Max 5)</label>
                                                      {/* Display Uploaded Files */}
                                                     {uploadedFiles.length > 0 && (
                                                         <div className="mb-3 mt-1 space-y-2">
                                                            <ul className="text-sm space-y-1">
                                                            {uploadedFiles.map((file, index) => (
                                                                <li key={index} className="flex items-center justify-between text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                                                                    <span className="truncate pr-2 flex items-center gap-1.5"><ImageIcon size={14}/> {file.name} ({ (file.size / 1024).toFixed(1) } KB)</span>
                                                                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 ml-2 focus:outline-none flex-shrink-0 p-0.5 rounded hover:bg-red-100" aria-label={`Remove ${file.name}`}> <X size={16}/> </button>
                                                                </li>
                                                            ))}
                                                            </ul>
                                                        </div>
                                                     )}
                                                     {/* File Input Area */}
                                                     {uploadedFiles.length < 5 && (
                                                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-white hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
                                                            <div className="space-y-1 text-center">
                                                                <Upload size={36} className="mx-auto text-gray-400" />
                                                                <div className="flex text-sm text-gray-600 justify-center">
                                                                    <span className="font-medium text-primary hover:text-primary-dark cursor-pointer">Click to upload</span>
                                                                    <input id="file-upload" name="referenceImages" type="file" className="sr-only" onChange={handleFileChange} multiple accept="image/jpeg,image/png,image/webp,application/pdf" ref={fileInputRef} disabled={uploadedFiles.length >= 5}/>
                                                                    <p className="pl-1 hidden sm:block">or drag and drop</p>
                                                                </div>
                                                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB. Max files: {5 - uploadedFiles.length}</p>
                                                            </div>
                                                        </div>
                                                     )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-10"> <button type="button" onClick={handlePrevStep} className="btn-outline text-sm inline-flex items-center gap-1"><ArrowLeft size={16}/> Back</button> <button type="button" onClick={handleNextStep} className="btn-primary text-sm">Continue</button> </div>
                                        </div>
                                    )}
                                    {formStep === 3 && (
                                         <div className="max-w-3xl mx-auto">
                                            <h3 className="text-xl font-poppins font-semibold mb-8 text-center text-neutral-dark">3. Your Contact Information</h3>
                                            <div className="space-y-5">
                                                <div><label htmlFor="name" className="form-label">Full Name*</label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" className="input-field" required autoComplete="name"/></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> <div><label htmlFor="email" className="form-label">Email Address*</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" className="input-field" required autoComplete="email"/></div> <div><label htmlFor="phone" className="form-label">Phone Number*</label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Your phone number" className="input-field" required autoComplete="tel"/></div> </div>
                                                {/* Agreement Checkbox */}
                                                <div className="pt-2">
                                                    <label className="flex items-start cursor-pointer">
                                                         <input type="checkbox" className="mt-1 mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded flex-shrink-0" required aria-describedby="privacy-policy-link"/>
                                                         <span className="text-xs text-gray-600">I agree to the processing of my data as per the <Link id="privacy-policy-link" to="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link> and consent to be contacted regarding my request.</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-10">
                                                 <button type="button" onClick={handlePrevStep} className="btn-outline text-sm inline-flex items-center gap-1"><ArrowLeft size={16}/> Back</button>
                                                 <button type="submit" disabled={formStatus === 'submitting'} className={`btn-primary text-sm flex items-center gap-2 px-6 py-2.5 ${formStatus === 'submitting' ? 'opacity-70 cursor-wait' : ''}`}>
                                                    {formStatus === 'submitting' && <Loader2 size={16} className="animate-spin" />}
                                                    {formStatus === 'submitting' ? 'Submitting...' : 'Submit Custom Request'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.form>
                            </AnimatePresence>
                        </div>
                     )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-secondary-light">
                 <div className="container-custom">
                     <SectionTitle subtitle="Questions & Answers" title="Custom Order FAQs" className="text-neutral-dark" subtitleClassName="text-primary"/>
                     <div className="max-w-3xl mx-auto space-y-4">
                         {[ { q: "How long does a custom piece take?", a: "Timelines vary based on complexity, materials, and current workload. Simple pieces might take 4-6 weeks, complex ones 2-4 months. We provide a clear estimate during consultation." }, { q: "Is a deposit required?", a: "Yes, we typically require a 50% deposit to commence work, with the balance due before delivery. Payment plans can be discussed for larger projects." }, { q: "Can I change the design after ordering?", a: "Minor adjustments are often possible during the early design phase. Changes after production starts may incur extra costs or delays. We discuss all requests individually." }, { q: "Do you deliver custom furniture?", a: "Absolutely. We offer professional delivery and installation. Fees vary by location. White glove service is recommended for large items." } ].map((faq, index) => (
                             <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true, amount: 0.3 }} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"> <h3 className="text-base md:text-lg font-poppins font-semibold text-neutral-dark mb-2">{faq.q}</h3> <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p> </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </PageTransition>
    );
};

// Reusable form label class
const formLabelClass = "block text-sm font-medium text-gray-700 mb-1.5"; // Added margin

export default CustomOrderPage;