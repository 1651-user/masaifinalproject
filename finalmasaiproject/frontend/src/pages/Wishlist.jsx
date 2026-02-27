import { useState, useEffect } from "react";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { wishlistService } from "../services";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { removeFromWishlist } = useWishlist();

    useEffect(() => {
        wishlistService.get().then((r) => setItems(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const remove = async (productId) => {
        const success = await removeFromWishlist(productId);
        if (success) {
            setItems(items.filter((i) => i.product_id !== productId));
        }
    };

    const handleAddToCart = async (productId) => {
        try { await addToCart(productId, 1); toast.success("Added to cart!"); } catch { toast.error("Failed"); }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-square rounded-2xl mb-3" style={{ background: "var(--border)" }} />
                        <div className="h-3 rounded mb-1.5" style={{ background: "var(--border)", width: "75%" }} />
                        <div className="h-3 rounded" style={{ background: "var(--border)", width: "45%" }} />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
            <div className="max-w-5xl mx-auto px-6 py-14">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Your Favourites</h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <Link to="/products" className="flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: "var(--accent)" }}>
                        Continue shopping <ArrowRight size={14} />
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 rounded-2xl animate-up" style={{ background: "var(--bg-secondary)", border: "1px dashed var(--border)" }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--accent-light)" }}>
                            <Heart size={36} style={{ color: "var(--accent)" }} />
                        </div>
                        <p className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Nothing saved yet</p>
                        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Tap the heart on any listing to save it here.</p>
                        <Link to="/products" className="btn-primary">Browse listings</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7 animate-up">
                        {items.map((item) => {
                            const p = item.products;
                            return (
                                <div key={item.id} className="group">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-2.5" style={{ background: "var(--bg-secondary)" }}>
                                        <Link to={`/products/${p?.id}`}>
                                            <img src={p?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"} alt={p?.name}
                                                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                                        </Link>
                                        <button onClick={() => remove(item.product_id)}
                                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                                            style={{ background: "rgba(255,255,255,0.9)", color: "var(--accent)" }}>
                                            <Heart size={15} className="fill-current" />
                                        </button>
                                    </div>

                                    {p?.users?.store_name && (
                                        <p className="text-[11px] mb-0.5" style={{ color: "var(--text-muted)" }}>{p.users.store_name}</p>
                                    )}
                                    <Link to={`/products/${p?.id}`}>
                                        <h3 className="text-sm font-medium line-clamp-1 mb-1 hover:underline" style={{ color: "var(--text)" }}>{p?.name}</h3>
                                    </Link>
                                    <p className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>{formatPrice(p?.price)}</p>

                                    <button onClick={() => handleAddToCart(p?.id)}
                                        className="w-full btn-primary !text-xs !py-2 !rounded-full !justify-center">
                                        <ShoppingCart size={13} /> Add to cart
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
