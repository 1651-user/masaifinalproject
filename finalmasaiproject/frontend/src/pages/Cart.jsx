import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";

export default function Cart() {
    const { items, updateQuantity, removeItem, clearCart, total, loading } = useCart();

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl mb-4 animate-pulse" style={{ background: "var(--border)" }} />)}
        </div>
    );

    if (items.length === 0) return (
        <div className="max-w-lg mx-auto px-4 py-20 text-center animate-up">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--accent-light)" }}>
                <ShoppingBag size={40} style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>Your cart is empty</h2>
            <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn-primary !text-base">Start shopping <ArrowRight size={16} /></Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-14 animate-up" style={{ background: "var(--bg)" }}>
            <div className="flex items-center justify-between mb-7">
                <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Shopping cart ({items.length})</h1>
                <button onClick={() => { clearCart(); toast.success("Cart cleared"); }} className="text-sm font-semibold hover:underline" style={{ color: "var(--text-muted)" }}>Clear all</button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {items.map((item) => {
                        const p = item.products;
                        return (
                            <div key={item.id} className="flex gap-4 p-4 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                <Link to={`/products/${p?.id}`} className="shrink-0">
                                    <img src={p?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"} alt={p?.name}
                                        className="w-24 h-24 rounded-xl object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/products/${p?.id}`} className="text-sm font-semibold hover:underline line-clamp-2 mb-1 block" style={{ color: "var(--text)" }}>{p?.name}</Link>
                                    {p?.users?.store_name && <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{p.users.store_name}</p>}
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center border-2 rounded-full" style={{ borderColor: "var(--border)" }}>
                                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1.5 rounded-l-full hover:bg-[var(--bg-secondary)] transition"><Minus size={13} style={{ color: "var(--text)" }} /></button>
                                            <span className="px-3 text-sm font-bold" style={{ color: "var(--text)" }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 rounded-r-full hover:bg-[var(--bg-secondary)] transition"><Plus size={13} style={{ color: "var(--text)" }} /></button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{formatPrice(p?.price * item.quantity)}</span>
                                            <button onClick={() => { removeItem(item.id); toast.success("Removed"); }} className="text-red-500 hover:text-red-600 transition"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div>
                    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <h2 className="text-lg font-bold mb-5" style={{ color: "var(--text)" }}>Order summary</h2>
                        <div className="space-y-2.5 mb-4 text-sm">
                            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Items ({items.length})</span><span style={{ color: "var(--text)" }}>{formatPrice(total)}</span></div>
                            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Shipping</span><span className="font-semibold" style={{ color: "var(--success)" }}>FREE</span></div>
                        </div>
                        <div className="border-t pt-4 mb-5" style={{ borderColor: "var(--border-light)" }}>
                            <div className="flex justify-between text-base font-bold" style={{ color: "var(--text)" }}>
                                <span>Total</span><span>{formatPrice(total)}</span>
                            </div>
                        </div>
                        <Link to="/checkout" className="btn-primary w-full !justify-center !text-base !py-3">Proceed to checkout</Link>
                        <Link to="/products" className="block text-center text-sm mt-3 hover:underline" style={{ color: "var(--text-muted)" }}>Continue shopping</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
