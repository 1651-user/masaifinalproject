import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";

/* fluid: fills 100% width, with responsive padding on sides */
const W = { width: "100%", paddingLeft: "clamp(16px, 5vw, 64px)", paddingRight: "clamp(16px, 5vw, 64px)" };

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            productService.getAll({ limit: 8, sort: "created_at", order: "desc" }),
            categoryService.getAll(),
        ])
            .then(([p, c]) => { setProducts(p.data.products || []); setCategories(c.data || []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ background: "var(--bg)", width: "100%" }}>

            {/* ── Hero ── */}
            <section style={{ background: "var(--bg-secondary)", padding: "28px 0" }}>
                <div style={{ ...W }}>
                    {/* Responsive grid: stacks on mobile */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 16,
                    }}>
                        {/* Main hero — span 2 cols when there's room */}
                        <div style={{
                            gridColumn: "span 2",
                            position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 320,
                        }}>
                            <img
                                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&h=500&fit=crop"
                                alt="Shop local"
                                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)" }} />
                            <div style={{ position: "relative", padding: "clamp(28px, 5vw, 52px)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 320 }}>
                                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: 12 }}>
                                    ShopLocal picks
                                </p>
                                <h1 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 28 }}>
                                    Discover<br />something<br />extraordinary
                                </h1>
                                <Link to="/products" className="btn-primary" style={{ alignSelf: "flex-start", fontSize: 15 }}>
                                    Shop now
                                </Link>
                            </div>
                        </div>

                        {/* Side banners */}
                        {[
                            { img: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=300&fit=crop", label: "Handmade gifts", cat: "handmade" },
                            { img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=300&fit=crop", label: "Fashion finds", cat: "clothing" },
                        ].map((b) => (
                            <Link key={b.label} to={`/products?category=${b.cat}`}
                                style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 150, display: "block", textDecoration: "none" }}
                                className="group">
                                <img src={b.img} alt={b.label} className="listing-img"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                                <div style={{ position: "absolute", bottom: 16, left: 18 }}>
                                    <p style={{ color: "white", fontWeight: 700, fontSize: 17, marginBottom: 3 }}>{b.label}</p>
                                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                        Shop now <ArrowRight size={11} />
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trust bar ── */}
            <div style={{ borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", background: "var(--bg)" }}>
                <div style={{ ...W, paddingTop: 14, paddingBottom: 14 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 36px" }}>
                        {[
                            { icon: Truck, label: "Free shipping over ₹499" },
                            { icon: Shield, label: "Buyer protection guarantee" },
                            { icon: RefreshCw, label: "Easy 30-day returns" },
                            { icon: Headphones, label: "24/7 support" },
                        ].map((t) => (
                            <span key={t.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                                <t.icon size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                {t.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Categories ── */}
            {categories.length > 0 && (
                <section style={{ padding: "52px 0", background: "var(--bg)" }}>
                    <div style={W}>
                        <h2 className="section-title">Shop by category</h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                            gap: "20px 16px"
                        }}>
                            {categories.map((cat) => (
                                <Link key={cat.id} to={`/products?category=${cat.id}`}
                                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textDecoration: "none" }}
                                    className="group">
                                    <div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-light)", transition: "border-color 0.2s, transform 0.2s" }}
                                        className="group-hover:border-[var(--accent)] group-hover:scale-105">
                                        <img src={cat.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200"} alt={cat.name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, textAlign: "center", color: "var(--text-secondary)", lineHeight: 1.3 }}>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── New Arrivals ── */}
            <section style={{ padding: "52px 0", background: "var(--bg-secondary)" }}>
                <div style={W}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Recently listed</h2>
                        <Link to="/products"
                            style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                            className="hover:underline">
                            See all <ArrowRight size={15} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div style={{ aspectRatio: "1", borderRadius: 16, background: "var(--border)", marginBottom: 12 }} />
                                    <div style={{ height: 12, borderRadius: 6, background: "var(--border)", width: "75%", marginBottom: 8 }} />
                                    <div style={{ height: 12, borderRadius: 6, background: "var(--border)", width: "45%" }} />
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
                            {products.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "64px 32px", borderRadius: 20, border: "2px dashed var(--border)", background: "var(--bg)" }}>
                            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No products listed yet</p>
                            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Be the first vendor to add products!</p>
                            <Link to="/signup" className="btn-primary">Open your shop</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Vendor CTA ── */}
            <section style={{ padding: "52px 0", background: "var(--bg)" }}>
                <div style={W}>
                    <div style={{ borderRadius: 24, background: "var(--accent-light)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32, padding: "clamp(28px, 4vw, 52px)" }}>
                            <div style={{ flex: 1, minWidth: 240 }}>
                                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                                    Sell on ShopLocal
                                </p>
                                <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "var(--text)", lineHeight: 1.25, marginBottom: 14 }}>
                                    Turn your creativity<br />into income
                                </h2>
                                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24, maxWidth: 440 }}>
                                    Join thousands of independent sellers reaching customers who love unique, locally made products.
                                </p>
                                <Link to="/signup" className="btn-primary" style={{ fontSize: 15 }}>
                                    Open your shop — it&apos;s free
                                </Link>
                            </div>
                            <div style={{ width: "clamp(160px, 15vw, 220px)", aspectRatio: "1", borderRadius: 20, overflow: "hidden", flexShrink: 0 }} className="hidden md:block">
                                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop" alt="Vendor" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section style={{ padding: "52px 0", background: "var(--bg-secondary)" }}>
                <div style={W}>
                    <h2 className="section-title" style={{ textAlign: "center" }}>Loved by shoppers</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                        {[
                            { text: "Found the most beautiful hand-painted pottery. The vendor was amazing!", name: "Priya S.", rating: 5 },
                            { text: "Great selection of local artisans. My go-to for unique gifts.", name: "Rohan M.", rating: 5 },
                            { text: "Ordered twice now, always fast shipping and quality products.", name: "Anjali K.", rating: 5 },
                        ].map((r) => (
                            <div key={r.name} style={{ padding: "24px 28px", borderRadius: 20, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} style={{ fill: "#e56000", color: "#e56000" }} />)}
                                </div>
                                <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)", marginBottom: 16 }}>
                                    &ldquo;{r.text}&rdquo;
                                </p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>— {r.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
