import { useState, useEffect } from "react";
import { Package, User, Edit2, Save, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { orderService } from "../services";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";
import toast from "react-hot-toast";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function CustomerDashboard() {
    const { user, updateProfile } = useAuth();
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState("orders");
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({ name: "", phone: "", address: { street: "", city: "", state: "", zip: "" } });

    useEffect(() => {
        orderService.getAll().then((r) => setOrders(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user) setProfile({ name: user.name || "", phone: user.phone || "", address: user.address || { street: "", city: "", state: "", zip: "" } });
    }, [user]);

    const handleSave = async () => {
        try { await updateProfile(profile); toast.success("Profile updated"); setEditing(false); }
        catch { toast.error("Failed to update profile"); }
    };

    const tabs = [
        { k: "orders", l: "My Orders", icon: Package },
        { k: "profile", l: "Account", icon: User },
        { k: "wishlist", l: "Favourites", icon: Heart, link: "/wishlist" },
    ];

    return (
        <div style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Profile banner */}
                <div className="rounded-2xl p-5 mb-7 flex items-center gap-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0" style={{ background: "var(--accent)" }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>{user?.name}</h1>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email} · Customer since {new Date(user?.created_at || Date.now()).getFullYear()}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {tabs.map((t) => t.link ? (
                        <Link key={t.k} to={t.link} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
                            style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                            <t.icon size={14} /> {t.l}
                        </Link>
                    ) : (
                        <button key={t.k} onClick={() => setTab(t.k)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
                            style={tab === t.k ? { background: "var(--accent)", color: "white" } : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                            <t.icon size={14} /> {t.l}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {tab === "orders" && (
                    <div className="space-y-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />)
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                <Package size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                                <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>No orders yet</p>
                                <Link to="/products" className="btn-primary !text-sm">Start shopping</Link>
                            </div>
                        ) : orders.map((order) => (
                            <div key={order.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-light)" }}>
                                    <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                                        <span>Order <strong style={{ color: "var(--text)", fontFamily: "monospace" }}>#{order.id.slice(0, 8)}</strong></span>
                                        <span>{formatDate(order.created_at)}</span>
                                        <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{formatPrice(order.total)}</span>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-xs mb-3 font-medium" style={{ color: "var(--text-muted)" }}>{order.order_items?.length || 0} item(s)</p>
                                    {/* Tracking timeline */}
                                    <div className="flex items-center gap-0">
                                        {STEPS.map((s, i) => {
                                            const reached = STEPS.indexOf(order.status) >= i;
                                            const isLast = i === STEPS.length - 1;
                                            return (
                                                <div key={s} className="flex items-center flex-1 last:flex-none">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 rounded-full border-2 transition" style={{ background: reached ? "var(--accent)" : "var(--border)", borderColor: reached ? "var(--accent)" : "var(--border)" }} />
                                                        <span className="text-[9px] mt-1 capitalize whitespace-nowrap" style={{ color: reached ? "var(--accent)" : "var(--text-muted)", fontWeight: reached ? 700 : 400 }}>{s}</span>
                                                    </div>
                                                    {!isLast && <div className="flex-1 h-0.5 mx-1" style={{ background: STEPS.indexOf(order.status) > i ? "var(--accent)" : "var(--border)" }} />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Profile */}
                {tab === "profile" && (
                    <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>Personal information</h2>
                            {!editing ? (
                                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition hover:bg-[var(--bg-secondary)]" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                                    <Edit2 size={13} /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}><X size={13} /> Cancel</button>
                                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold text-white" style={{ background: "var(--accent)" }}><Save size={13} /> Save</button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: "Full name", key: "name" }, { label: "Email", key: "email", disabled: true, value: user?.email },
                                { label: "Phone", key: "phone" }, { label: "Street", key: "address.street" },
                                { label: "City", key: "address.city" }, { label: "State", key: "address.state" },
                                { label: "ZIP / PIN", key: "address.zip" },
                            ].map((f) => (
                                <div key={f.key}>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                                    <input type="text" disabled={!editing || f.disabled}
                                        value={f.value !== undefined ? f.value : (f.key.includes(".") ? profile.address?.[f.key.split(".")[1]] || "" : profile[f.key] || "")}
                                        onChange={(e) => {
                                            if (f.key.includes(".")) { const k = f.key.split(".")[1]; setProfile({ ...profile, address: { ...profile.address, [k]: e.target.value } }); }
                                            else setProfile({ ...profile, [f.key]: e.target.value });
                                        }}
                                        className="input disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
