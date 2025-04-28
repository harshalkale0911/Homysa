// frontend/src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link
import { Send, MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import SectionTitle from '../components/ui/SectionTitle';

// Interface for form data
interface ContactFormData { name: string; email: string; phone: string; subject: string; message: string; }
// Interface for API response
interface ApiResponse { success: boolean; message: string; contactId?: string; }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const ContactPage: React.FC = () => {
    const initialFormData: ContactFormData = { name: '', email: '', phone: '', subject: '', message: '' };
    const [formData, setFormData] = useState<ContactFormData>(initialFormData);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formStatus === 'error' || formStatus === 'success') { setFormStatus('idle'); setSubmitMessage(''); }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('submitting');
        setSubmitMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/contact/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result: ApiResponse = await response.json();
            if (!response.ok || !result.success) { throw new Error(result.message || `Submission failed (${response.status})`); }
            setFormStatus('success');
            setSubmitMessage(result.message || "Message Sent Successfully!");
            setFormData(initialFormData); // Reset form
        } catch (error: any) {
            console.error('Submission error:', error);
            setFormStatus('error');
            setSubmitMessage(error.message || 'An unexpected error occurred.');
        }
        // Don't reset loading in finally, let status dictate UI
    };

    const handleSendAnother = () => { setFormStatus('idle'); setSubmitMessage(''); }

    return (
        <PageTransition>
            {/* Hero section */}
            <section className="relative py-36 px-6 bg-neutral-dark isolate">
                 {/* ... Hero content ... */}
                 <div className="absolute inset-0 opacity-15 z-[-1]"> <img src="https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Abstract contact background texture" className="w-full h-full object-cover" loading="lazy"/> </div> <div className="relative container-custom text-center z-10"> <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4"> Contact Us </motion.h1> <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto"> We're here to help. Reach out for inquiries, support, or to start your design journey. </motion.p> </div>
            </section>

            {/* Contact form and info section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Contact form column */}
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
                            <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-neutral-dark mb-6"> Send Us a Message </h2>
                            <AnimatePresence mode="wait">
                                {formStatus === 'success' ? (
                                    <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border border-green-200 p-6 rounded-lg text-center min-h-[300px] flex flex-col justify-center items-center"> <CheckCircle size={48} className="text-green-600 mb-4" /> <h3 className="text-xl font-poppins font-semibold text-green-800 mb-2"> Message Sent! </h3> <p className="text-green-700 mb-6">{submitMessage}</p> <button onClick={handleSendAnother} className="text-sm text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1">Send another message</button> </motion.div>
                                ) : (
                                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-5">
                                         {formStatus === 'error' && submitMessage && ( <div className="text-sm text-red-700 bg-red-100 p-3 rounded-md flex items-center gap-2 border border-red-200" role="alert"> <AlertCircle size={16} /> <span>{submitMessage}</span> </div> )}
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> <div> <label htmlFor="name" className="form-label">Your Name*</label> <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full name" className="input-field" required autoComplete="name"/> </div> <div> <label htmlFor="email" className="form-label">Email Address*</label> <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" className="input-field" required autoComplete="email"/> </div> </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> <div> <label htmlFor="phone" className="form-label">Phone Number <span className="text-gray-400">(Optional)</span></label> <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Your phone number" className="input-field" autoComplete="tel"/> </div> <div> <label htmlFor="subject" className="form-label">Subject*</label> <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="input-field" required> <option value="" disabled>Select a subject...</option> <option value="General Inquiry">General Inquiry</option> <option value="Product Information">Product Information</option> <option value="Custom Order Request">Custom Order Request</option> <option value="Customer Support">Customer Support</option> <option value="Collaboration Inquiry">Collaboration Inquiry</option> <option value="Feedback">Feedback</option> <option value="Other">Other</option> </select> </div> </div>
                                         <div> <label htmlFor="message" className="form-label">Your Message*</label> <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder="How can we help you today?" className="input-field h-36 resize-none" required ></textarea> </div>
                                         <div> <button type="submit" disabled={formStatus === 'submitting'} className={`btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 ${formStatus === 'submitting' ? 'opacity-70 cursor-wait' : ''}`}> {formStatus === 'submitting' ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />} <span>{formStatus === 'submitting' ? 'Sending...' : 'Send Message'}</span> </button> </div>
                                    </motion.form>
                                )}
                             </AnimatePresence>
                        </motion.div>

                        {/* Contact information column */}
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="mt-10 lg:mt-0">
                             <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-neutral-dark mb-6"> Contact Information </h2>
                             <div className="bg-secondary-light p-6 md:p-8 rounded-lg"> <div className="space-y-6"> { [ { icon: MapPin, title: "Our Location", lines: ["123 Furniture Street, Design District", "Mumbai, Maharashtra 400001, India"] }, { icon: Phone, title: "Phone Number", lines: ["+91 930 712 5756", "+91 222 333 4444"], href: "tel:+919307125756" }, { icon: Mail, title: "Email Address", lines: ["hkale6888@gmail.com", "info@homysa.com"], href: "mailto:info@homysa.com" }, { icon: Clock, title: "Working Hours", lines: ["Mon - Fri: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM", "Sunday: Closed"] } ].map(item => ( <div key={item.title} className="flex items-start"> <div className="bg-primary/10 text-primary rounded-full p-3 mr-4 flex-shrink-0 mt-0.5"> <item.icon size={20} /> </div> <div> <h3 className="font-poppins font-semibold text-neutral-dark mb-1 text-base">{item.title}</h3> {item.lines.map((line, i) => ( item.href && i === 0 ? <a key={i} href={item.href} className="block text-sm text-gray-700 hover:text-primary focus:outline-none focus:text-primary">{line}</a> : <p key={i} className="text-sm text-gray-700">{line}</p> ))} </div> </div> ))} </div> </div>
                         </motion.div>
                    </div>
                </div>
            </section>

            {/* Map section */}
            <section className="pb-20 pt-10 bg-white">
                <div className="container-custom">
                     <SectionTitle subtitle="Visit Our Showroom" title="Find Us Here" className="text-neutral-dark" subtitleClassName="text-primary"/>
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-white p-2 rounded-lg shadow-md overflow-hidden border border-gray-200">
                         <div className="aspect-w-16 aspect-h-9 w-full">
                             <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60442.04094473121!2d78.54602068112735!3d19.26500586259116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd458fcd9d9a0d7%3A0xf23076830e4f75d6!2sKatol%2C%20Maharashtra%20441302!5e0!3m2!1sen!2sin!4v1721197416636!5m2!1sen!2sin" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Homysa Showroom Location" aria-label="Map showing Homysa Showroom Location"></iframe>
                         </div>
                     </motion.div>
                 </div>
            </section>

        </PageTransition>
    );
};

// Helper class (ensure defined in global CSS)
const formLabelClass = "block text-sm font-medium text-gray-700 mb-1";

export default ContactPage;