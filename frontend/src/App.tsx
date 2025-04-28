// frontend/src/app.tsx
import React from 'react'; // Import React
import { Routes, Route, useLocation, Link } from 'react-router-dom'; // Import Link
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';
import Chatbot from './components/ui/Chatbot'; // Import the Chatbot component

// Page Components (User-facing)
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import InteriorDesignPage from './pages/InteriorDesignPage';
import WoodenWorkPage from './pages/WoodenWorkPage';
import CustomOrderPage from './pages/CustomOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // <-- Import ForgotPasswordPage
// import ResetPasswordPage from './pages/ResetPasswordPage'; // <-- Import ResetPasswordPage when created

// Optional Pages
// import CartPage from './pages/CartPage';
// import CheckoutPage from './pages/CheckoutPage';
// import OrderSuccessPage from './pages/OrderSuccessPage';
// import NotFoundPage from './pages/NotFoundPage';
// import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
// import TermsOfServicePage from './pages/TermsOfServicePage';


// Account Section Components (Nested within AccountPage)
import ProfileSection from './components/account/ProfileSection';
import OrdersSection from './components/account/OrdersSection';
import ChangePasswordSection from './components/account/ChangePasswordSection';
// Add more account sections if needed (e.g., Addresses, Wishlist)

// Admin Section Components (Nested within AdminLayout)
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminOrders from './components/admin/AdminOrders';
import AdminUsers from './components/admin/AdminUsers';
// Add other admin pages/components as needed
// import AdminCustomOrders from './components/admin/AdminCustomOrders'; // TODO: Create this component
// import AdminContacts from './components/admin/AdminContacts';       // TODO: Create this component
// import AdminSettings from './components/admin/AdminSettings';       // TODO: Create this component
// import AdminProductForm from './components/admin/AdminProductForm'; // TODO: Create this component
// import AdminOrderDetail from './components/admin/AdminOrderDetail'; // TODO: Create this component


// Authentication Wrappers (Optional but recommended)
// import ProtectedRoute from './components/auth/ProtectedRoute'; // Protects user routes
// import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute'; // Protects admin routes
// import AuthProvider from './context/AuthContext'; // Your auth context provider


function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Determine main content padding based on whether header is present
    const mainContentPadding = !isAdminRoute ? 'pt-16 md:pt-20' : '';

    return (
        // <AuthProvider> // Wrap with your Auth Provider if using Context API
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans antialiased"> {/* Added antialiased */}
            {!isAdminRoute && <Header />}

            {/* Use a div for main content to apply padding correctly */}
            <main className={`flex-grow ${mainContentPadding}`}>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>

                        {/* === Public & User Routes === */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/shop/:productId" element={<ProductPage />} />
                        <Route path="/interior-design" element={<InteriorDesignPage />} />
                        <Route path="/wooden-work" element={<WoodenWorkPage />} />
                        <Route path="/custom-order" element={<CustomOrderPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        {/* Optional redirects */}
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/signup" element={<AuthPage />} />
                        {/* --- Added Password Reset Routes --- */}
                        <Route path="/password/forgot" element={<ForgotPasswordPage />} /> {/* <-- ADDED */}
                        {/* <Route path="/password/reset/:token" element={<ResetPasswordPage />} /> */} {/* <-- ADDED (when component exists) */}
                        {/* ----------------------------------- */}
                        {/* <Route path="/cart" element={<CartPage />} /> */}
                        {/* <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} /> */}
                        {/* <Route path="/order/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} /> */}
                        {/* <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> */}
                        {/* <Route path="/terms-of-service" element={<TermsOfServicePage />} /> */}


                        {/* === Protected User Account Routes === */}
                        {/* Wrap AccountPage with ProtectedRoute if needed */}
                        <Route path="/account" element={<AccountPage />}>
                            {/* Default route for /account */}
                            <Route index element={<ProfileSection />} />
                            {/* Explicit routes */}
                            <Route path="profile" element={<ProfileSection />} />
                            <Route path="orders" element={<OrdersSection />} />
                            <Route path="change-password" element={<ChangePasswordSection />} />
                            {/* Add other nested account routes here */}
                            {/* <Route path="addresses" element={<AddressesSection />} /> */}
                            {/* <Route path="wishlist" element={<WishlistSection />} /> */}
                        </Route>

                        {/* === Protected Admin Routes === */}
                         {/* Wrap AdminLayout with ProtectedAdminRoute if needed */}
                        <Route path="/admin" element={<AdminLayout />}>
                            {/* Default route for /admin */}
                            <Route index element={<AdminDashboard />} />
                            {/* Explicit routes */}
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            {/* <Route path="products/new" element={<AdminProductForm mode="add" />} /> */}
                            {/* <Route path="products/edit/:productId" element={<AdminProductForm mode="edit" />} /> */}
                            <Route path="orders" element={<AdminOrders />} />
                            {/* <Route path="orders/:orderId" element={<AdminOrderDetail />} /> */}
                            <Route path="users" element={<AdminUsers />} />
                            {/* <Route path="custom-orders" element={<AdminCustomOrders />} /> */}
                            {/* <Route path="contacts" element={<AdminContacts />} /> */}
                            {/* <Route path="settings" element={<AdminSettings />} /> */}
                             {/* Catch-all for unknown admin routes? */}
                             {/* <Route path="*" element={<AdminNotFound />} /> */}
                        </Route>

                        {/* === Catch-all 404 Route === */}
                        {/* <Route path="*" element={<NotFoundPage />} /> */}
                         {/* Simple fallback for now */}
                         <Route path="*" element={<div className="text-center py-20"><h2>404 - Page Not Found</h2><Link to="/" className="text-primary hover:underline">Go Home</Link></div>} />


                    </Routes>
                </AnimatePresence>
            </main>

             {/* Render Footer only for non-admin routes */}
             {!isAdminRoute && <Footer />}

             {/* Render Chatbot globally for non-admin routes */}
             {!isAdminRoute && <Chatbot />}
        </div>
        // </AuthProvider>
    );
}

export default App;