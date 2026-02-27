import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!user) return <Navigate to="/login" />;
    if (!role && user.role === "vendor") return <Navigate to="/vendor/dashboard" />;
    if (!role && user.role === "admin") return <Navigate to="/admin/dashboard" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
}

function AppRoutes() {
    const PageFallback = () => (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <Suspense fallback={<PageFallback />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/vendor/dashboard" element={<ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            </Routes>
        </Suspense>
    );
}

export default function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <div className="flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1">
                                    <AppRoutes />
                                </main>
                                <Footer />
                            </div>
                            <Toaster position="top-right" toastOptions={{
                                style: { background: "var(--color-bg-card)", color: "var(--color-text)", border: "1px solid var(--color-border)" },
                                duration: 3000,
                            }} />
                        </WishlistProvider>
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}
