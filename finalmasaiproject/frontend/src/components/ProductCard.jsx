import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const [hovered, setHovered] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const wishlisted = user ? isWishlisted(product.id) : false;
    const [adding, setAdding] = useState(false);

    const discount = product.compare_price > product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: x * 10, y: y * -10 });
    };

    const handleMouseLeave = () => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { toast.error("Sign in to add to cart"); return; }
        if (user.role === "vendor") { toast.error("Vendors cannot purchase products"); return; }
        setAdding(true);
        try { await addToCart(product.id, 1); toast.success("Added to cart!"); }
        catch { toast.error("Couldn't add to cart"); }
        finally { setAdding(false); }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(product.id);
    };

    const img = product.images?.[0] || null;
    const rating = product.avg_rating || 0;

    return (
        <Link
            to={`/products/${product.id}`}
            className="group relative block perspective-[2000px] no-underline"
            onMouseEnter={() => setHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* 3D Container with Tilt */}
            <div
                className="relative aspect-[3/4.2] rounded-[var(--radius-luxury)] overflow-hidden glass-morphism border-white/5 transition-all duration-700 group-hover:border-white/20 group-hover:shadow-luxury"
                style={{
                    transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${hovered ? 1.02 : 1})`,
                    transition: hovered ? "transform 0.1s ease-out, border-color 0.7s ease" : "transform 0.8s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.7s ease"
                }}
            >
                {/* Product Image */}
                {img ? (
                    <>
                        <img
                            src={img}
                            alt={product.name}
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-700 z-10" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]/5 text-[var(--text-muted)] opacity-50 text-[8px] font-black uppercase tracking-[0.8em]">
                        NO_VISUAL_DATA
                    </div>
                )}

                {/* Floating Tags */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                    {discount > 0 && (
                        <span className="bg-white text-black text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Wishlist Icon - Minimal Ghost Circle */}
                {user?.role !== "vendor" && (
                    <button
                        onClick={handleWishlist}
                        className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 z-30 ${hovered || wishlisted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                            } group/heart`}
                    >
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-full border border-white/10 group-hover/heart:border-[var(--accent)] group-hover/heart:scale-110 transition-all" />
                        <Heart
                            size={14}
                            className={`relative z-10 transition-all duration-500 ${wishlisted ? "text-[var(--accent)] fill-[var(--accent)] scale-125" : "text-white/40"}`}
                        />
                    </button>
                )}

                {/* Minimalist Quick Add Circle */}
                {product.stock > 0 && user?.role !== "vendor" && (
                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className={`absolute bottom-8 right-8 w-14 h-14 rounded-full bg-white text-black transition-all duration-500 z-30 flex items-center justify-center overflow-hidden group/add ${hovered ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-10 rotate-90"
                            } hover:bg-black hover:text-white hover:scale-110 active:scale-90 shadow-2xl`}
                    >
                        {adding ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                    </button>
                )}

                {/* Editorial Info Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-700 pointer-events-none z-20 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {product.stock <= 5 && product.stock > 0 && (
                            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-[var(--accent)] animate-pulse">Low_Stock</span>
                        )}
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/80 truncate max-w-[100px]">Artisan ID: {product.user_id?.slice(-6).toUpperCase()}</span>
                    </div>
                </div>

                {/* Specular Light Sweep */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-1000">
                    <div className="absolute top-1/2 left-1/2 -translate-x-[200%] -translate-y-1/2 w-32 h-[200%] bg-white/20 rotate-[35deg] group-hover:translate-x-[200%] transition-transform duration-[2s] ease-in-out" />
                </div>
            </div>

            {/* Title & Price - Editorial Layout */}
            <div className="mt-8 px-2 transition-colors duration-500">
                <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-2xl font-black font-editorial italic text-[var(--text)] leading-[0.9] tracking-tighter line-clamp-2 group-hover:text-[var(--accent)] transition-all duration-500">
                        {product.name}
                    </h3>
                    <div className="text-right">
                        <span className="block text-2xl font-black text-[var(--text)] tracking-widest">{formatPrice(product.price)}</span>
                        {product.compare_price > product.price && (
                            <span className="block text-[10px] font-black text-[var(--text-muted)] line-through tracking-tighter mt-1">
                                {formatPrice(product.compare_price)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 opacity-40 group-hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 overflow-hidden">
                            <div className={`w-full h-full bg-[var(--accent)] opacity-${rating ? '100' : '0'}`} style={{ opacity: (rating / 5) }} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text)]">Rate_ {rating || "0.0"}</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">
                        {product.users?.store_name || "Official_Release"}
                    </p>
                </div>
            </div>
        </Link>
    );
}
