import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
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

            <section style={{ background: "var(--bg-secondary)", padding: "28px 0" }}>
                <div style={{ ...W }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 16,
                    }}>
                        <div style={{
                            gridColumn: "span 2",
                            position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 320,
                            background: "linear-gradient(135deg, var(--accent) 0%, #1a1a2e 100%)",
                        }}>
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
                            { label: "Handmade gifts", cat: "handmade", bg: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)" },
                            { label: "Fashion finds", cat: "clothing", bg: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" },
                        ].map((b) => (
                            <Link key={b.label} to={`/products?category=${b.cat}`}
                                style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 150, display: "flex", alignItems: "flex-end", textDecoration: "none", background: b.bg }}
                                className="group">
                                <div style={{ padding: "16px 18px" }}>
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
                                        {cat.image_url
                                            ? <img src={cat.image_url} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <div style={{ width: "100%", height: "100%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-muted)" }}>No image</div>
                                        }
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, textAlign: "center", color: "var(--text-secondary)", lineHeight: 1.3 }}>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

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

                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}
