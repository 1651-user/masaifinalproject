import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Star, ShoppingBag, Tag } from "lucide-react";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_IMAGES = {
    "sports": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=600&fit=crop",
    "handmade": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=600&fit=crop",
    "clothing": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=600&fit=crop",
    "jewelry": "https://images.unsplash.com/photo-1515562141589-67f0d569b6c2?w=600&h=600&fit=crop",
    "electronics": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop",
    "books": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop",
    "beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
    "home": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    "food": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
};

const getCategoryImage = (name) => {
    if (!name) return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=600&fit=crop";
    const nameLower = name.toLowerCase();

    // Exact or direct includes match first
    for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
        if (nameLower.includes(key) || key.includes(nameLower)) return url;
    }

    // Word-by-word aggressive match for names like "Food & Beverages" -> "food"
    const words = nameLower.split(/[\s&,-]+/);
    for (const word of words) {
        if (word.length > 2 && CATEGORY_IMAGES[word]) {
            return CATEGORY_IMAGES[word];
        }
    }

    return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=600&fit=crop";
};

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        Promise.all([
            productService.getAll({ limit: 8, sort: "created_at", order: "desc" }),
            categoryService.getAll(),
        ])
            .then(([p, c]) => {
                setProducts(p.data.products || []);
                setCategories(c.data || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useGSAP(() => {
        gsap.from(".hero-content > *", {
            y: 60,
            scale: 0.8,
            opacity: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: "back.out(1.7)",
            clearProps: "all"
        });

        gsap.from(".trust-bar", {
            y: 40,
            opacity: 0,
            duration: 0.9,
            delay: 0.5,
            ease: "elastic.out(1, 0.7)",
            clearProps: "all"
        });

        if (!loading) {
            gsap.from(".cat-card", {
                opacity: 0,
                scale: 0.8,
                y: 50,
                stagger: 0.1,
                duration: 0.8,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: ".cat-section",
                    start: "top 80%"
                },
                clearProps: "all"
            });

            gsap.from(".product-reveal", {
                opacity: 0,
                y: 40,
                stagger: 0.08,
                duration: 0.6,
                scrollTrigger: {
                    trigger: ".product-section",
                    start: "top 80%"
                },
                clearProps: "all"
            });
        }
    }, { scope: containerRef, dependencies: [loading] });

    return (
        <div ref={containerRef} className="bg-[var(--bg)] min-h-screen">

            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=2070&q=80"
                        alt="Shop Local Hero"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent" />
                </div>

                <div className="container relative z-10 py-32">
                    <div className="hero-content max-w-2xl">
                        <span className="inline-block px-5 py-2 bg-[var(--accent)]/10 border-2 border-[var(--accent)] rounded-full text-[12px] font-black uppercase tracking-widest text-[var(--accent)] mb-6 shadow-sm">
                            Support Local Businesses
                        </span>

                        <h1 className="text-7xl md:text-9xl bubble-text leading-[0.9] mb-8 transform -rotate-2">
                            Shop <span>Local.</span><br />
                            Support <span>Small.</span>
                        </h1>

                        <p className="text-xl text-[var(--text-muted)] font-medium leading-relaxed mb-10 max-w-xl">
                            Discover handpicked products from independent local vendors near you. Every purchase directly supports small business owners in your community.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-white font-black rounded-full hover:bg-[var(--accent-hover)] hover:scale-105 transition-all no-underline shadow-xl hover:shadow-[0_10px_40px_rgba(255,77,109,0.4)]"
                            >
                                <ShoppingBag size={20} />
                                Shop Now
                            </Link>
                            <Link
                                to="/categories"
                                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-[var(--accent)] text-[var(--accent)] font-black rounded-full hover:bg-[var(--accent)] hover:text-white hover:scale-105 transition-all no-underline"
                            >
                                Browse Categories
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <div className="trust-bar bg-black/[0.03] backdrop-blur-md border-y border-black/5 py-8 mt-10">
                <div className="container py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Truck, title: "Free Delivery", desc: "On orders over ₹500" },
                            { icon: Shield, title: "Secure Payments", desc: "100% safe & encrypted" },
                            { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free" },
                            { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                                    <f.icon size={18} className="text-[var(--accent)]" />
                                </div>
                                <div>
                                    <p className="text-base font-black text-[var(--text)]">{f.title}</p>
                                    <p className="text-sm font-medium text-[var(--text-muted)]">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shop by Category */}
            <section className="py-20 container cat-section">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest text-[var(--accent)] mb-2">Explore</p>
                        <h2 className="text-4xl md:text-5xl bubble-text">Shop by Category</h2>
                    </div>
                    <Link
                        to="/categories"
                        className="flex items-center gap-2 text-base font-black text-[var(--text-muted)] hover:text-[var(--accent)] transition-all no-underline"
                    >
                        View All <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-white/5 rounded-2xl mb-3" />
                                <div className="h-4 bg-white/5 rounded-full w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {categories.slice(0, 10).map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?category=${cat.slug || cat.name?.toLowerCase()}`}
                                className="cat-card group block no-underline"
                            >
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 shadow-sm border border-black/5 group-hover:border-black/20 transition-colors">
                                    <img
                                        src={cat.image_url || getCategoryImage(cat.name)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getCategoryImage(cat.name);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
                                </div>
                                <h3 className="text-xl font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors text-center font-['Playfair_Display'] tracking-tight">{cat.name}</h3>
                                {cat.product_count != null && (
                                    <p className="text-xs font-bold text-[var(--text-muted)] text-center uppercase tracking-widest">{cat.product_count} items</p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Featured Products */}
            <section
                className="py-24 glass-morphism border-t border-black/5 product-section mt-20 relative rounded-t-[4rem] shadow-sm"
            >
                <div className="container relative z-10">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest text-[var(--accent)] mb-2">Just Arrived</p>
                            <h2 className="text-4xl md:text-5xl bubble-text">New Arrivals</h2>
                        </div>
                        <Link
                            to="/products"
                            className="flex items-center gap-2 text-base font-black text-[var(--text-muted)] hover:text-[var(--accent)] transition-all no-underline"
                        >
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse space-y-4">
                                    <div className="aspect-square bg-white/5 rounded-2xl" />
                                    <div className="h-4 bg-white/5 rounded-full w-3/4" />
                                    <div className="h-4 bg-white/5 rounded-full w-1/2" />
                                </div>
                            ))
                        ) : products.length > 0 ? (
                            products.slice(0, 8).map((product) => (
                                <div key={product.id} className="product-reveal">
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-4 py-20 text-center">
                                <ShoppingBag size={48} className="text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                                <p className="text-[var(--text-muted)] font-medium">Products coming soon</p>
                            </div>
                        )}
                    </div>

                    {products.length > 0 && (
                        <div className="mt-12 text-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-[var(--accent)] text-[var(--accent)] font-black rounded-full hover:bg-[var(--accent)] hover:text-white hover:scale-105 transition-all no-underline"
                            >
                                See All Products <ArrowRight size={20} />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Become A Seller CTA */}
            <section className="py-24 container">
                <div
                    className="glass-morphism rounded-[4rem] p-12 md:p-20 text-center shadow-sm border border-black/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Tag size={200} className="text-[var(--accent)] transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <Tag size={48} className="text-[var(--accent)] mx-auto mb-8" />
                        <h2 className="text-5xl md:text-6xl bubble-text mb-6">Are you a local creator?</h2>
                        <p className="text-xl md:text-2xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join our marketplace to reach local customers, manage your inventory online, and grow your small business with Shop_Local.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--accent)] text-white font-black rounded-full hover:bg-[var(--accent-hover)] hover:scale-105 transition-all no-underline shadow-[0_10px_30px_rgba(255,77,109,0.3)]"
                        >
                            Become a Vendor
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
