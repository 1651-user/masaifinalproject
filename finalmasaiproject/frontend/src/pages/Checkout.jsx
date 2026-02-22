import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { orderService, couponService } from "../services";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [form, setForm] = useState({ street: "", city: "", state: "", zip: "", payment_method: "cod" });

    const handleCoupon = async () => {
        if (!couponCode) return;
        try {
            const r = await couponService.validate(couponCode);
            setDiscount(r.data.discount_percent);
            setCouponApplied(true);
            toast.success(`${r.data.discount_percent}% off applied!`);
        } catch (e) { toast.error(e.response?.data?.error || "Invalid coupon"); setDiscount(0); setCouponApplied(false); }
    };

    const discountAmt = (total * discount) / 100;
    const finalTotal = total - discountAmt;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!items.length) { toast.error("Cart is empty"); return; }
        if (!form.street || !form.city || !form.state || !form.zip) { toast.error("Please fill in all address fields"); return; }
        setLoading(true);
        try {
            await orderService.create({ shipping_address: form, payment_method: form.payment_method, coupon_code: discount > 0 ? couponCode : undefined });
            toast.success("Order placed successfully!");
            navigate("/dashboard");
        } catch (e) { toast.error(e.response?.data?.error || "Failed to place order"); }
        setLoading(false);
    };

    if (!items.length) { navigate("/cart"); return null; }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 animate-up" style={{ background: "var(--bg)" }}>
            <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>Checkout</h1>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-7">
                <div className="md:col-span-2 space-y-5">
                    {/* Shipping */}
                    <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <h2 className="text-base font-bold mb-5" style={{ color: "var(--text)" }}>Shipping address</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Street address</label>
                                <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required className="input" placeholder="123 Main St, Apartment 4B" />
                            </div>
                            {[{ k: "city", l: "City", p: "Mumbai" }, { k: "state", l: "State", p: "Maharashtra" }, { k: "zip", l: "PIN code", p: "400001" }].map((f) => (
                                <div key={f.k}>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>{f.l}</label>
                                    <input type="text" value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} required className="input" placeholder={f.p} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <h2 className="text-base font-bold mb-5" style={{ color: "var(--text)" }}>Payment method</h2>
                        <div className="space-y-2.5">
                            {[{ v: "cod", l: "Cash on Delivery", desc: "Pay when you receive your order" }, { v: "card", l: "Card Payment", desc: "Credit or debit card" }].map((o) => (
                                <label key={o.v} className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border-2 transition" style={{ borderColor: form.payment_method === o.v ? "var(--accent)" : "var(--border-light)", background: form.payment_method === o.v ? "var(--accent-light)" : "var(--bg)" }}>
                                    <input type="radio" name="payment" value={o.v} checked={form.payment_method === o.v} onChange={() => setForm({ ...form, payment_method: o.v })} className="accent-[var(--accent)]" />
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{o.l}</p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{o.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Coupon */}
                    <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <h2 className="text-base font-bold mb-4" style={{ color: "var(--text)" }}>Coupon code</h2>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter promo code" className="input !pl-10 !rounded-full" disabled={couponApplied} />
                            </div>
                            <button type="button" onClick={handleCoupon} disabled={couponApplied} className="btn-secondary !rounded-full !text-sm !px-5">Apply</button>
                        </div>
                        {couponApplied && (
                            <div className="flex items-center gap-1.5 mt-2.5 text-sm font-semibold" style={{ color: "var(--success)" }}>
                                <CheckCircle size={15} /> {discount}% discount applied!
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary (sticky) */}
                <div className="sticky top-24 self-start">
                    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <h2 className="text-base font-bold mb-4" style={{ color: "var(--text)" }}>Order summary</h2>
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between gap-2 text-xs">
                                    <span className="line-clamp-1 flex-1" style={{ color: "var(--text-secondary)" }}>{item.products?.name} ×{item.quantity}</span>
                                    <span className="font-semibold shrink-0" style={{ color: "var(--text)" }}>{formatPrice(item.products?.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-3 space-y-2 text-sm" style={{ borderColor: "var(--border-light)" }}>
                            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Subtotal</span><span style={{ color: "var(--text)" }}>{formatPrice(total)}</span></div>
                            {discount > 0 && <div className="flex justify-between font-semibold" style={{ color: "var(--success)" }}><span>Discount ({discount}%)</span><span>−{formatPrice(discountAmt)}</span></div>}
                            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Shipping</span><span className="font-semibold" style={{ color: "var(--success)" }}>FREE</span></div>
                        </div>
                        <div className="border-t mt-3 pt-3 flex justify-between font-bold text-base" style={{ borderColor: "var(--border-light)", color: "var(--text)" }}>
                            <span>Total</span><span>{formatPrice(finalTotal)}</span>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full !justify-center !text-base !py-3 mt-5">
                            {loading ? "Placing order…" : "Place order"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
