import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus, Truck, Shield, RefreshCw, ChevronLeft, ThumbsUp } from "lucide-react";
import { productService, reviewService } from "../services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice, formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [submitting, setSubmitting] = useState(false);
    const { isWishlisted, toggleWishlist } = useWishlist();
    const wishlisted = user ? isWishlisted(product?.id) : false;

    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        Promise.all([
            productService.getById(id),
            reviewService.getByProduct(id),
        ])
            .then(([p, r]) => {
                setProduct(p.data);
                setReviews(r.data);
            })
            .catch(() => toast.error("Product not found"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) { toast.error("Please sign in to add to cart"); return; }
        if (user.role === "vendor") { toast.error("Vendors cannot purchase products"); return; }
        try { await addToCart(product.id, quantity); toast.success("Added to cart!"); }
        catch { toast.error("Couldn't add to cart"); }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user) { toast.error("Sign in to leave a review"); return; }
        setSubmitting(true);
        try {
            if (editingReviewId) {
                const res = await reviewService.update(editingReviewId, reviewForm);
                setReviews(reviews.map((r) => r.id === editingReviewId ? res.data : r));
                setEditingReviewId(null);
                toast.success("Review updated!");
            } else {
                const res = await reviewService.add(id, reviewForm);
                setReviews([res.data, ...reviews]);
                toast.success("Review posted!");
            }
            setReviewForm({ rating: 5, comment: "" });
        } catch (err) { toast.error(err.response?.data?.error || "Failed to post review"); }
        setSubmitting(false);
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await reviewService.delete(reviewId);
            setReviews(reviews.filter((r) => r.id !== reviewId));
            toast.success("Review deleted");
        } catch (err) {
            toast.error("Failed to delete review");
        }
    };

    const startEditReview = (review) => {
        setReviewForm({ rating: review.rating, comment: review.comment || "" });
        setEditingReviewId(review.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleVoteHelpful = async (reviewId) => {
        try {
            const res = await reviewService.voteHelpful(reviewId);
            setReviews(reviews.map((r) => r.id === reviewId ? { ...r, helpful_count: res.data.helpful_count } : r));
        } catch {
            toast.error("Could not register vote");
        }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="grid md:grid-cols-2 gap-10">
                <div className="aspect-square rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />
                <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-4 rounded" style={{ background: "var(--border)", width: `${90 - i * 10}%` }} />)}</div>
            </div>
        </div>
    );
    if (!product) return <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Product not found</div>;

    const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700"];
    const discount = product.compare_price > product.price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
    const avgRating = product.avg_rating || 0;

    return (
        <div style={{ background: "var(--bg)" }} className="min-h-screen pb-20">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <Link to="/products" className="inline-flex items-center gap-1 text-sm mb-8 hover:underline" style={{ color: "var(--text-muted)" }}>
                    <ChevronLeft size={14} /> Back to results
                </Link>

                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3" style={{ background: "var(--bg-secondary)" }}>
                            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                            {user?.role !== "vendor" && (
                                <button onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                                    style={{ background: "white", color: wishlisted ? "#e56000" : "#767676" }}>
                                    <Heart size={18} className={wishlisted ? "fill-[#e56000]" : ""} />
                                </button>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2.5">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setSelectedImage(i)}
                                        className="w-16 h-16 rounded-lg overflow-hidden border-2 transition"
                                        style={{ borderColor: i === selectedImage ? "var(--accent)" : "transparent" }}>
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="animate-up">
                        {product.users?.store_name && (
                            <p className="text-sm font-semibold mb-1" style={{ color: "var(--accent)" }}>{product.users.store_name}</p>
                        )}
                        {product.categories?.name && (
                            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>{product.categories.name}</p>
                        )}
                        <h1 className="text-2xl font-bold leading-snug mb-3" style={{ color: "var(--text)" }}>{product.name}</h1>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={15} className={i < Math.round(avgRating) ? "fill-[#e56000] text-[#e56000]" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{avgRating.toFixed(1)}</span>
                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>({reviews.length} reviews)</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>{formatPrice(product.price)}</span>
                            {product.compare_price > product.price && (
                                <>
                                    <span className="text-base line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(product.compare_price)}</span>
                                    <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{discount}% off</span>
                                </>
                            )}
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                            <p className="text-sm font-semibold mb-3" style={{ color: "#c45000" }}>Only {product.stock} left in stock!</p>
                        )}

                        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{product.description}</p>

                        {product.stock > 0 ? (
                            user?.role === "vendor" ? (
                                <div className="py-3 px-4 rounded-2xl text-sm font-medium" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border-light)" }}>
                                    You are viewing this as a vendor. Switch to a customer account to purchase.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Quantity</p>
                                        <div className="inline-flex items-center border-2 rounded-full" style={{ borderColor: "var(--border)" }}>
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 hover:bg-[var(--bg-secondary)] rounded-l-full transition"><Minus size={14} style={{ color: "var(--text)" }} /></button>
                                            <span className="w-10 text-center text-sm font-bold" style={{ color: "var(--text)" }}>{quantity}</span>
                                            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2.5 hover:bg-[var(--bg-secondary)] rounded-r-full transition"><Plus size={14} style={{ color: "var(--text)" }} /></button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={handleAddToCart} className="btn-primary flex-1 !justify-center !text-base !py-3">
                                            <ShoppingCart size={17} /> Add to cart
                                        </button>
                                        <button onClick={() => toggleWishlist(product.id)}
                                            className="px-5 py-3 rounded-full border-2 transition"
                                            style={{ borderColor: "var(--border)", color: wishlisted ? "var(--accent)" : "var(--text-secondary)" }}>
                                            <Heart size={17} className={wishlisted ? "fill-[var(--accent)]" : ""} />
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="py-4 rounded-2xl text-center font-semibold text-red-600" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>Sold out</div>
                        )}

                        <div className="mt-6 pt-5 border-t space-y-2.5" style={{ borderColor: "var(--border-light)" }}>
                            {[
                                { icon: Truck, text: "Estimated delivery: 3–7 business days" },
                                { icon: Shield, text: "Secure payment & buyer protection" },
                                { icon: RefreshCw, text: "Returns accepted within 30 days" },
                            ].map((t) => (
                                <div key={t.text} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                                    <t.icon size={16} style={{ color: "var(--accent)" }} /> {t.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-14">
                    <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text)" }}>
                        Reviews for this listing ({reviews.length})
                    </h2>

                    {reviews.length > 0 && (
                        <div className="flex items-center gap-4 mb-7 p-5 rounded-2xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)" }}>
                            <div className="text-center">
                                <p className="text-4xl font-bold" style={{ color: "var(--text)" }}>{avgRating.toFixed(1)}</p>
                                <div className="flex mt-1">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.round(avgRating) ? "fill-[#e56000] text-[#e56000]" : "text-gray-300"} />)}</div>
                            </div>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                        </div>
                    )}

                    {user?.role === "customer" && (() => {
                        const myReview = reviews.find(r => r.user_id === user.id);
                        const showForm = !myReview || editingReviewId;
                        return showForm ? (
                            <form onSubmit={handleReview} className="mb-8 p-5 rounded-2xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)" }}>
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                                        {editingReviewId ? "Edit your review" : "Leave a review"}
                                    </p>
                                    {editingReviewId && (
                                        <button type="button" onClick={() => {
                                            setEditingReviewId(null);
                                            setReviewForm({ rating: 5, comment: "" });
                                        }} className="text-xs hover:underline" style={{ color: "var(--text-muted)" }}>Cancel edit</button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                                            <Star size={22} className={s <= reviewForm.rating ? "fill-[#e56000] text-[#e56000]" : "text-gray-300"} />
                                        </button>
                                    ))}
                                </div>
                                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="Share your experience with this product…" rows={3}
                                    className="input !rounded-xl w-full resize-none mb-3" />
                                <button type="submit" disabled={submitting} className="btn-primary !text-sm">
                                    {submitting ? "Posting…" : editingReviewId ? "Update review" : "Submit review"}
                                </button>
                            </form>
                        ) : (
                            <div className="mb-8 p-5 rounded-2xl text-center" style={{ background: "var(--bg-secondary)", border: "1px dashed var(--border)" }}>
                                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>You already reviewed this product</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>You can edit or delete your review below.</p>
                            </div>
                        );
                    })()}

                    <div className="space-y-4">
                        {reviews.length > 0 ? reviews.map((r) => (
                            <div key={r.id} className="pb-5 border-b last:border-0" style={{ borderColor: "var(--border-light)" }}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>
                                            {r.users?.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{r.users?.name || "Anonymous"}</p>
                                            <div className="flex mt-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={11} className={i < r.rating ? "fill-[#e56000] text-[#e56000]" : "text-gray-300"} />)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>{formatDate(r.created_at)}</span>
                                        {user?.id === r.user_id && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => startEditReview(r)} className="text-xs font-semibold hover:underline" style={{ color: "var(--accent)" }}>Edit</button>
                                                <button onClick={() => handleDeleteReview(r.id)} className="text-xs font-semibold hover:underline" style={{ color: "var(--danger)" }}>Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {r.comment && <p className="text-sm leading-relaxed ml-10" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>}
                                <div className="ml-10 mt-2">
                                    <button onClick={() => handleVoteHelpful(r.id)} className="helpful-btn">
                                        <ThumbsUp size={12} />
                                        Helpful{r.helpful_count > 0 ? ` (${r.helpful_count})` : ""}
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>No reviews yet — be the first!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
