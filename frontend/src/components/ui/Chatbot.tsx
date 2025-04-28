// frontend/src/components/ui/Chatbot.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, AlertCircle, Bot, User, Copy } from 'lucide-react'; // Added Bot, User, Copy

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

interface ChatMessage {
    role: 'user' | 'model' | 'system'; // Added system role for initial messages
    text: string;
    timestamp?: number; // Optional timestamp
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'system', text: "Hello! I'm Homysa Helper. Ask me about our wooden furniture, materials, care tips, or services!" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setError(null); // Clear error when toggling
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
             console.log("Copied to clipboard"); // Add visual feedback later
        }, (err) => {
            console.error('Failed to copy text: ', err);
        });
    };

    const handleSendMessage = useCallback(async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || loading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput, timestamp: Date.now() };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setLoading(true);
        setError(null);

        // Prepare history for API (exclude system messages if backend handles context)
        const historyForApi = messages
            .filter(msg => msg.role === 'user' || msg.role === 'model') // Only user/model roles for history
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }] // Gemini API format
            }));

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedInput,
                    history: historyForApi // Send relevant history
                }),
                // credentials: 'include', // If auth is needed for chatbot
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || result.reply || `Chatbot error (${response.status})`);
            }

            const botMessage: ChatMessage = { role: 'model', text: result.reply, timestamp: Date.now() };
            setMessages(prev => [...prev, botMessage]);

        } catch (err: any) {
            console.error("Chatbot API Error:", err);
            setError(err.message || "Sorry, something went wrong. Please try again.");
            // Optionally add an error message to the chat interface
            const errorMessage: ChatMessage = { role: 'system', text: `Error: ${err.message || "Could not get response."}`, timestamp: Date.now() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            // Refocus input after response
            inputRef.current?.focus();
        }
    }, [inputValue, loading, messages]); // Include messages in dependencies

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            handleSendMessage();
        }
    };


    return (
        <>
            {/* Chat Bubble Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={isOpen ? 'Close Chat' : 'Open Chat'}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageSquare size={24} />
                        </motion.div>
                    )}
                 </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed bottom-20 right-6 z-[60] w-[90vw] max-w-sm h-[70vh] max-h-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="chatbot-title"
                    >
                        {/* Header */}
                        <header className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex justify-between items-center flex-shrink-0">
                            <h2 id="chatbot-title" className="font-semibold font-poppins flex items-center gap-2">
                                <Bot size={20}/> Homysa Helper
                            </h2>
                            <button onClick={toggleChat} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20" aria-label="Close chat">
                                <X size={20} />
                            </button>
                        </header>

                        {/* Chat Body */}
                        <div ref={chatBodyRef} className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar bg-gray-50">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                     {/* Bot Avatar */}
                                    {msg.role !== 'user' && msg.role !== 'system' && (
                                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center self-start mt-1">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    {/* Message Bubble */}
                                     <div className={`relative group max-w-[80%] px-3 py-2 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : msg.role === 'model' ? 'bg-white text-neutral-dark border border-gray-200 rounded-bl-none' : 'bg-transparent text-gray-500 text-center text-xs w-full max-w-full'}`}>
                                         {/* Format message text (handle newlines) */}
                                         <p className="text-sm whitespace-pre-wrap break-words">
                                             {msg.text}
                                         </p>
                                          {/* Copy Button for Bot Messages */}
                                         {msg.role === 'model' && (
                                             <button
                                                 onClick={() => copyToClipboard(msg.text)}
                                                 className="absolute -top-2 -right-2 p-1 bg-gray-200 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-gray-300"
                                                 title="Copy response"
                                                 aria-label="Copy bot response"
                                            >
                                                 <Copy size={12} />
                                             </button>
                                         )}
                                     </div>
                                    {/* User Avatar */}
                                     {msg.role === 'user' && (
                                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center self-start mt-1">
                                            <User size={16} />
                                        </div>
                                     )}
                                </motion.div>
                            ))}
                             {/* Loading Indicator */}
                             {loading && (
                                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-2 mt-2">
                                     <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"> <Bot size={16} /> </div>
                                     <div className="px-3 py-2 rounded-xl bg-gray-200 text-neutral-dark rounded-bl-none inline-flex items-center gap-1.5">
                                         <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-pulse delay-0"></span>
                                         <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-pulse delay-100"></span>
                                         <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-pulse delay-200"></span>
                                     </div>
                                 </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <footer className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
                             {/* Error Display */}
                             {error && !loading && (
                                <p className="text-xs text-red-600 mb-1.5 flex items-center gap-1"><AlertCircle size={14}/> {error}</p>
                             )}
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about furniture..."
                                    className="input-field flex-grow !py-2 text-sm" // Override padding if needed
                                    disabled={loading}
                                    aria-label="Chat message input"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !inputValue.trim()}
                                    className="btn-primary p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    aria-label="Send message"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;