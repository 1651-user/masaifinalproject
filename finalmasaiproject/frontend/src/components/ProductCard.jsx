import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [hovered, setHovered] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [adding, setAdding] = useState(false);

    const discount = product.compare_price > product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;

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

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlisted(!wishlisted);
        toast.success(wishlisted ? "Removed from favourites" : "Saved to favourites");
    };

    const img = product.images?.[0] || null;
    const rating = product.avg_rating || 0;
    const reviewCount = product.review_count || 0;

    return (
        <Link
            to={`/products/${product.id}`}
            className="listing-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ display: "block", background: "transparent" }}
        >
            {/* Image */}
            <div style={{ position: "relative", aspectRatio: "1", borderRadius: 16, overflow: "hidden", background: "var(--bg-secondary)", marginBottom: 12 }}>
                {img ? (
                    <img
                        src={img}
                        alt={product.name}
                        className="listing-img"
                        style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>
                        No image
                    </div>
                )}

                {/* Badges */}
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {discount >= 5 && (
                        <span style={{ background: "var(--accent)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>
                            {discount}% off
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span style={{ background: "rgba(0,0,0,0.7)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>
                            Sold out
                        </span>
                    )}
                    {product.stock > 0 && product.stock <= 3 && (
                        <span style={{ background: "#fff3eb", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, border: "1px solid var(--accent)" }}>
                            Only {product.stock} left
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                {user?.role !== "vendor" && (
                    <button
                        onClick={handleWishlist}
                        style={{
                            position: "absolute", top: 10, right: 10,
                            width: 34, height: 34, borderRadius: "50%",
                            background: "rgba(255,255,255,0.92)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "transform 0.15s",
                            boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
                            transform: hovered || wishlisted ? "scale(1)" : "scale(0)",
                            opacity: hovered || wishlisted ? 1 : 0,
                        }}
                    >
                        <Heart size={16} style={{ color: wishlisted ? "var(--accent)" : "#767676", fill: wishlisted ? "var(--accent)" : "none" }} />
                    </button>
                )}

                {/* Quick add — customers only */}
                {product.stock > 0 && user?.role !== "vendor" && (
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "10px 12px",
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "translateY(0)" : "translateY(8px)",
                        transition: "all 0.2s ease"
                    }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            style={{
                                width: "100%", background: "white", color: "var(--text)",
                                fontWeight: 700, fontSize: 13, padding: "9px 0",
                                borderRadius: 99, border: "2px solid transparent",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                                transition: "background 0.15s"
                            }}
                        >
                            <ShoppingCart size={14} />
                            {adding ? "Adding…" : "Add to cart"}
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: "0 2px" }}>
                {product.users?.store_name && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3 }}>
                        {product.users.store_name}
                    </p>
                )}
                <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 5, lineHeight: 1.4 }}
                    className="line-clamp-2">
                    {product.name}
                </h3>
                {rating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} style={{ fill: i < Math.round(rating) ? "#e56000" : "none", color: i < Math.round(rating) ? "#e56000" : "#ccc" }} />
                        ))}
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({reviewCount})</span>
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{formatPrice(product.price)}</span>
                    {product.compare_price > product.price && (
                        <span style={{ fontSize: 12, textDecoration: "line-through", color: "var(--text-muted)" }}>
                            {formatPrice(product.compare_price)}
                        </span>
                    )}
                </div>
                {product.free_shipping && (
                    <p style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, marginTop: 3 }}>Free shipping</p>
                )}
            </div>
        </Link>
    );
}
