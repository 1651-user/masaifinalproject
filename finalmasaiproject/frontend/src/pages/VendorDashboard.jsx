import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
    Package, DollarSign, ShoppingCart, AlertTriangle, Plus, Edit2, Trash2,
    Save, X, Tag, TrendingUp, Search, Filter, ImageIcon
} from "lucide-react";
import { vendorService, productService, categoryService, couponService, orderService } from "../services";
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function VendorDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState("overview");
    const [dashData, setDashData] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "", description: "", price: "", compare_price: "",
        stock: "", category_id: "", images: "",
    });
    const [imageMode, setImageMode] = useState("url"); // "url" | "device"
    const [uploadingFiles, setUploadingFiles] = useState([]); // [{ name, status }]

    const [listSearch, setListSearch] = useState("");
    const [listCategory, setListCategory] = useState("");
    const [listSort, setListSort] = useState("newest");

    const [couponForm, setCouponForm] = useState({ code: "", discount_percent: "", max_uses: "100", expires_at: "" });
    const [showCouponForm, setShowCouponForm] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dash, prods, ords, cats, cps] = await Promise.all([
                vendorService.getDashboard(),
                vendorService.getProducts(),
                vendorService.getOrders(),
                categoryService.getAll(),
                couponService.getAll(),
            ]);
            setDashData(dash.data);           // { stats, low_stock_products, recent_orders }
            setProducts(Array.isArray(prods.data) ? prods.data : []);
            setOrders(Array.isArray(ords.data) ? ords.data : []);
            setCategories(Array.isArray(cats.data) ? cats.data : []);
            setCoupons(Array.isArray(cps.data) ? cps.data : []);
        } catch (err) {
            console.error("VendorDashboard loadData error:", err);
            toast.error("Failed to load dashboard data");
        }
        setLoading(false);
    };

    const filteredProducts = useMemo(() => {
        let list = [...products];
        if (listSearch) list = list.filter(p => p.name.toLowerCase().includes(listSearch.toLowerCase()));
        if (listCategory) list = list.filter(p => p.category_id === listCategory);
        if (listSort === "newest") list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (listSort === "price_asc") list.sort((a, b) => a.price - b.price);
        else if (listSort === "price_desc") list.sort((a, b) => b.price - a.price);
        else if (listSort === "stock") list.sort((a, b) => a.stock - b.stock);
        return list;
    }, [products, listSearch, listCategory, listSort]);

    const openNewForm = () => {
        setEditingId(null);
        setForm({ name: "", description: "", price: "", compare_price: "", stock: "", category_id: "", images: "" });
        setImageMode("url");
        setUploadingFiles([]);
        setShowForm(true);
        setTab("products");
    };

    const openEditForm = (p) => {
        setEditingId(p.id);
        setForm({
            name: p.name, description: p.description || "", price: p.price,
            compare_price: p.compare_price || "", stock: p.stock,
            category_id: p.category_id || "", images: p.images?.join(", ") || "",
        });
        setImageMode("url");
        setUploadingFiles([]);
        setShowForm(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.stock) {
            toast.error("Name, price and stock are required");
            return;
        }
        const payload = {
            ...form,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
            images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
        };
        try {
            if (editingId) {
                await productService.update(editingId, payload);
                toast.success("Listing updated");
            } else {
                await productService.create(payload);
                toast.success("Listing published");
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: "", description: "", price: "", compare_price: "", stock: "", category_id: "", images: "" });
            setUploadingFiles([]);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save listing");
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        const newEntries = files.map(f => ({ name: f.name, status: "uploading" }));
        setUploadingFiles(prev => [...prev, ...newEntries]);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fd = new FormData();
            fd.append("image", file);
            try {
                const res = await fetch(`${API_URL}/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                // Append the returned URL to the images string
                setForm(prev => ({
                    ...prev,
                    images: prev.images ? `${prev.images}, ${data.url}` : data.url,
                }));
                setUploadingFiles(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(x => x.name === file.name && x.status === "uploading");
                    if (idx !== -1) copy[idx] = { ...copy[idx], status: "done" };
                    return copy;
                });
                toast.success(`${file.name} uploaded`);
            } catch (err) {
                setUploadingFiles(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(x => x.name === file.name && x.status === "uploading");
                    if (idx !== -1) copy[idx] = { ...copy[idx], status: "error" };
                    return copy;
                });
                toast.error(`Failed to upload ${file.name}: ${err.message}`);
            }
        }
        // Reset file input
        e.target.value = "";
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm("Delete this listing? This cannot be undone.")) return;
        try { await productService.delete(id); toast.success("Listing deleted"); loadData(); }
        catch { toast.error("Failed to delete listing"); }
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            await couponService.create({
                ...couponForm,
                discount_percent: parseInt(couponForm.discount_percent),
                max_uses: parseInt(couponForm.max_uses),
            });
            toast.success("Coupon created");
            setShowCouponForm(false);
            setCouponForm({ code: "", discount_percent: "", max_uses: "100", expires_at: "" });
            loadData();
        } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    };

    const TABS = [
        { k: "overview", l: "Overview", icon: TrendingUp },
        { k: "products", l: "Listings", icon: Package },
        { k: "orders", l: "Orders", icon: ShoppingCart },
        { k: "coupons", l: "Coupons", icon: Tag },
    ];

    const stats = dashData?.stats;

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />)}
            </div>
        </div>
    );

    const chartData = dashData?.monthly_revenue?.length > 0
        ? dashData.monthly_revenue
        : [{ month: "This month", revenue: parseFloat(stats?.total_revenue) || 0 }];

    return (
        <div style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
            <div className="max-w-5xl mx-auto px-4 py-10">

                <div className="flex items-start justify-between mb-7 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Vendor Dashboard</h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {user?.store_name || "Your ShopLocal store"}
                        </p>
                    </div>
                    <button onClick={openNewForm} className="btn-primary !text-sm !py-2 !rounded-full flex items-center gap-1.5">
                        <Plus size={14} /> Add new listing
                    </button>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {TABS.map((t) => (
                        <button key={t.k} onClick={() => setTab(t.k)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
                            style={tab === t.k ? { background: "var(--accent)", color: "white" } : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                            <t.icon size={14} /> {t.l}
                        </button>
                    ))}
                </div>

                {tab === "overview" && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Listings", value: stats?.total_products ?? 0, icon: Package, sub: "active products" },
                                { label: "Revenue", value: formatPrice(parseFloat(stats?.total_revenue) || 0), icon: DollarSign, sub: "all time" },
                                { label: "Orders", value: stats?.total_orders ?? 0, icon: ShoppingCart, sub: "received" },
                                { label: "Low Stock", value: stats?.low_stock_count ?? 0, icon: AlertTriangle, sub: "need restocking", warn: true },
                            ].map((s) => (
                                <div key={s.label} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ background: s.warn ? "#fef3c7" : "var(--accent-light)" }}>
                                            <s.icon size={15} style={{ color: s.warn ? "#d97706" : "var(--accent)" }} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold"
                                        style={{ color: s.warn && (stats?.low_stock_count || 0) > 0 ? "#d97706" : "var(--text)" }}>
                                        {s.value}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                            <h3 className="text-base font-bold mb-4" style={{ color: "var(--text)" }}>Revenue overview</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} barCategoryGap="30%">
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid var(--border-light)", background: "var(--bg-card)" }} />
                                    <Bar dataKey="revenue" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {dashData?.low_stock_products?.length > 0 && (
                            <div className="rounded-2xl p-5" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#92400e" }}>
                                    <AlertTriangle size={15} /> Low stock alert
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {dashData.low_stock_products.map((p) => (
                                        <div key={p.id} className="flex justify-between text-sm p-2 rounded-xl" style={{ background: "white" }}>
                                            <span className="line-clamp-1" style={{ color: "var(--text)" }}>{p.name}</span>
                                            <span className="font-bold ml-2 shrink-0" style={{ color: "#d97706" }}>{p.stock} left</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text)" }}>Quick actions</h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={openNewForm} className="btn-primary !text-sm !py-2 !rounded-full flex items-center gap-1.5">
                                    <Plus size={13} /> Add listing
                                </button>
                                <button onClick={() => setTab("orders")} className="btn-secondary !text-sm !py-2 !rounded-full flex items-center gap-1.5">
                                    <ShoppingCart size={13} /> View orders
                                </button>
                                <button onClick={() => { setTab("coupons"); setShowCouponForm(true); }}
                                    className="btn-secondary !text-sm !py-2 !rounded-full flex items-center gap-1.5">
                                    <Tag size={13} /> Create coupon
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "products" && (
                    <div>
                        <div className="rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                            <div className="relative flex-1 min-w-[160px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                                <input type="text" value={listSearch} onChange={(e) => setListSearch(e.target.value)}
                                    placeholder="Search listings…" className="input !pl-9 !py-2 !rounded-full" />
                            </div>
                            <select value={listCategory} onChange={(e) => setListCategory(e.target.value)}
                                className="input !py-2 !rounded-full min-w-[140px]">
                                <option value="">All categories</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={listSort} onChange={(e) => setListSort(e.target.value)}
                                className="input !py-2 !rounded-full min-w-[140px]">
                                <option value="newest">Newest first</option>
                                <option value="price_asc">Price: low → high</option>
                                <option value="price_desc">Price: high → low</option>
                                <option value="stock">Lowest stock</option>
                            </select>
                            <span className="text-sm font-medium ml-auto shrink-0" style={{ color: "var(--text-muted)" }}>
                                {filteredProducts.length} / {products.length} listings
                            </span>
                            <button onClick={openNewForm} className="btn-primary !text-sm !py-2 !rounded-full flex items-center gap-1.5 shrink-0">
                                <Plus size={14} /> Add listing
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleProductSubmit}
                                className="rounded-2xl p-5 mb-5 space-y-4 animate-up"
                                style={{ background: "var(--bg-card)", border: "2px solid var(--accent)" }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
                                        {editingId ? "Edit listing" : "New listing"}
                                    </h3>
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="p-1.5 rounded-full hover:bg-[var(--bg-secondary)]" style={{ color: "var(--text-muted)" }}>
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Product title *</label>
                                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required className="input" placeholder="What are you selling?" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Description</label>
                                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            rows={3} className="input resize-none" placeholder="Describe your item — material, size, care instructions…" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Sale price (₹) *</label>
                                        <input type="number" step="0.01" min="0" value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                            required className="input" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Original / compare price (₹)</label>
                                        <input type="number" step="0.01" min="0" value={form.compare_price}
                                            onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                                            className="input" placeholder="Shows as strikethrough" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Stock quantity *</label>
                                        <input type="number" min="0" value={form.stock}
                                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                            required className="input" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Category</label>
                                        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                                            <option value="">No category</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                            <ImageIcon size={11} className="inline mr-1" />
                                            Product Images
                                        </label>

                                        <div className="flex gap-1 mb-3">
                                            {[
                                                { k: "device", label: "Upload from device" },
                                                { k: "url", label: "Paste URL" },
                                            ].map(t => (
                                                <button key={t.k} type="button"
                                                    onClick={() => setImageMode(t.k)}
                                                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition"
                                                    style={imageMode === t.k
                                                        ? { background: "var(--accent)", color: "white" }
                                                        : { background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }
                                                    }>
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>

                                        {imageMode === "device" && (
                                            <div>
                                                <label
                                                    htmlFor="img-file-input"
                                                    style={{
                                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                        gap: 8, padding: "24px 16px", borderRadius: 12,
                                                        border: "2px dashed var(--border)", cursor: "pointer",
                                                        background: "var(--bg-secondary)", transition: "border-color 0.2s",
                                                    }}
                                                    onDragOver={e => e.preventDefault()}
                                                >
                                                    <ImageIcon size={28} style={{ color: "var(--text-muted)" }} />
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Click to choose photos</p>
                                                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>JPG, PNG, WebP · Max 5MB each · Multiple allowed</p>
                                                    <input
                                                        id="img-file-input"
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        multiple
                                                        style={{ display: "none" }}
                                                        onChange={handleFileUpload}
                                                    />
                                                </label>

                                                {uploadingFiles.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {uploadingFiles.map((f, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg"
                                                                style={{ background: "var(--bg-secondary)" }}>
                                                                <span style={{
                                                                    color: f.status === "done" ? "var(--success)" : f.status === "error" ? "#ef4444" : "var(--accent)"
                                                                }}>
                                                                    {f.status === "done" ? "Done" : f.status === "error" ? "Failed" : "..."}
                                                                </span>
                                                                <span className="line-clamp-1" style={{ color: "var(--text-secondary)" }}>{f.name}</span>
                                                                <span className="ml-auto font-semibold" style={{
                                                                    color: f.status === "done" ? "var(--success)" : f.status === "error" ? "#ef4444" : "var(--text-muted)"
                                                                }}>
                                                                    {f.status === "done" ? "Uploaded" : f.status === "error" ? "Failed" : "Uploading…"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {imageMode === "url" && (
                                            <div>
                                                <input type="text" value={form.images}
                                                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                                                    className="input" placeholder="https://... , https://... (comma-separated)" />
                                                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                                    Paste one or more image URLs separated by commas
                                                </p>
                                            </div>
                                        )}

                                        {form.images && (
                                            <div className="flex gap-2 flex-wrap mt-3">
                                                {form.images.split(",").map((url, i) => url.trim() && (
                                                    <div key={i} style={{ position: "relative" }}>
                                                        <img src={url.trim()} alt="" className="w-20 h-20 rounded-xl object-cover"
                                                            style={{ border: "1px solid var(--border)" }}
                                                            onError={(e) => { e.target.style.display = "none"; }} />
                                                        <button type="button"
                                                            onClick={() => {
                                                                const updated = form.images.split(",").map(s => s.trim()).filter((s, idx) => idx !== i).join(", ");
                                                                setForm({ ...form, images: updated });
                                                            }}
                                                            style={{
                                                                position: "absolute", top: -6, right: -6, width: 20, height: 20,
                                                                borderRadius: "50%", background: "#ef4444", color: "white",
                                                                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                                                                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                                            }}
                                                        >×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Image preview is now handled inside the image section above */}


                                <div className="flex gap-2 pt-1">
                                    <button type="submit" className="btn-primary !text-sm !py-2 flex items-center gap-1.5">
                                        <Save size={13} /> {editingId ? "Save changes" : "Publish listing"}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary !text-sm !py-2">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-14 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
                                <Package size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                                <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                                    {products.length === 0 ? "No listings yet" : "No listings match your filter"}
                                </p>
                                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                                    {products.length === 0 ? "Add your first product to start selling" : "Try clearing the search or category filter"}
                                </p>
                                {products.length === 0 && (
                                    <button onClick={openNewForm} className="btn-primary !text-sm">Add your first listing</button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredProducts.map((p) => {
                                    const cat = categories.find(c => c.id === p.category_id);
                                    const discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0;
                                    return (
                                        <div key={p.id} className="flex items-center gap-4 rounded-2xl p-4"
                                            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                            <div className="relative shrink-0">
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                                                        style={{ background: "var(--border)" }}>No image</div>
                                                )}
                                                {p.stock < 10 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                                                        <AlertTriangle size={9} className="text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-semibold line-clamp-1" style={{ color: "var(--text)" }}>{p.name}</p>
                                                    {discount > 0 && (
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white shrink-0"
                                                            style={{ background: "var(--accent)" }}>{discount}% off</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
                                                    <span className="font-semibold" style={{ color: "var(--text)" }}>{formatPrice(p.price)}</span>
                                                    {p.compare_price && <span className="line-through">{formatPrice(p.compare_price)}</span>}
                                                    <span>·</span>
                                                    <span style={{ color: p.stock < 10 ? "#d97706" : "var(--text-muted)" }}>
                                                        {p.stock} in stock
                                                    </span>
                                                    {cat && (
                                                        <>
                                                            <span>·</span>
                                                            <span className="px-2 py-0.5 rounded-full" style={{ background: "var(--bg-secondary)" }}>{cat.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => openEditForm(p)}
                                                    className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition"
                                                    title="Edit listing" style={{ color: "var(--accent)" }}>
                                                    <Edit2 size={15} />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(p.id)}
                                                    className="p-2 rounded-full text-red-500 hover:bg-red-50 transition"
                                                    title="Delete listing">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {tab === "orders" && (
                    <div className="space-y-3">
                        {orders.length === 0
                            ? <p className="text-center py-12" style={{ color: "var(--text-muted)" }}>No orders received yet</p>
                            : orders.map((o) => {
                                const order = o.orders || {};
                                return (
                                    <div key={o.id} className="rounded-2xl overflow-hidden"
                                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b"
                                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border-light)" }}>
                                            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                                                <span className="font-mono">#{(order.id || o.id || "").slice(0, 8)}</span>
                                                <span>{formatDate(order.created_at || o.created_at)}</span>
                                                <span className={`badge ${getStatusColor(order.status || "pending")}`}>
                                                    {order.status || "pending"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                                                    {formatPrice(o.price * o.quantity)}
                                                </span>
                                                <select value={order.status || "pending"}
                                                    onChange={async (e) => {
                                                        try {
                                                            await orderService.updateStatus(order.id || o.id, e.target.value);
                                                            toast.success("Status updated");
                                                            loadData();
                                                        } catch { toast.error("Failed"); }
                                                    }}
                                                    className="text-xs rounded-full border px-2.5 py-1"
                                                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                                                    {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 px-5 py-3">
                                            <img src={o.products?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80"}
                                                alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium line-clamp-1" style={{ color: "var(--text)" }}>{o.products?.name}</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Qty: {o.quantity} · {formatPrice(o.price)} each</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {tab === "coupons" && (
                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                                {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
                            </p>
                            <button onClick={() => setShowCouponForm(!showCouponForm)} className="btn-primary !text-sm !py-2 !rounded-full flex items-center gap-1.5">
                                <Plus size={14} /> Create coupon
                            </button>
                        </div>

                        {showCouponForm && (
                            <form onSubmit={handleCouponSubmit}
                                className="rounded-2xl p-5 mb-5 space-y-4 animate-up"
                                style={{ background: "var(--bg-card)", border: "2px solid var(--accent)" }}>
                                <h3 className="font-bold" style={{ color: "var(--text)" }}>New discount coupon</h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Coupon code</label>
                                        <input type="text" value={couponForm.code}
                                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                            required className="input" placeholder="e.g. SAVE20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Discount %</label>
                                        <input type="number" min="1" max="100" value={couponForm.discount_percent}
                                            onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })}
                                            required className="input" placeholder="20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Max uses</label>
                                        <input type="number" min="1" value={couponForm.max_uses}
                                            onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                                            className="input" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Expires at</label>
                                        <input type="datetime-local" value={couponForm.expires_at}
                                            onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                                            required className="input" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn-primary !text-sm !py-2">Create coupon</button>
                                    <button type="button" onClick={() => setShowCouponForm(false)} className="btn-secondary !text-sm !py-2">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {coupons.length === 0
                                ? <p className="text-center py-10" style={{ color: "var(--text-muted)" }}>No coupons yet</p>
                                : coupons.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between rounded-2xl p-4"
                                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 rounded-lg font-mono text-sm font-bold"
                                                style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1.5px dashed var(--accent)" }}>
                                                {c.code}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{c.discount_percent}% off</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.used_count}/{c.max_uses} used</p>
                                            </div>
                                        </div>
                                        <span className={`badge ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                            {c.is_active ? "Active" : "Expired"}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
