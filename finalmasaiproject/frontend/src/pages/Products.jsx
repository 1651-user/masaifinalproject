import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
    { name: "Clothing", id: "clothing" },
    { name: "Jewelry", id: "jewelry" },
    { name: "Home & Garden", id: "home-garden" },
    { name: "Electronics", id: "electronics" },
    { name: "Books", id: "books" },
    { name: "Beauty", id: "beauty" },
    { name: "Sports", id: "sports" },
    { name: "Handmade", id: "handmade" },
];

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const containerRef = useRef(null);
    const emptyStateRef = useRef(null);

    useGSAP(() => {
        if (!loading && products.length > 0) {
            gsap.from(".product-reveal", {
                opacity: 0,
                y: 50,
                stagger: 0.1,
                duration: 1.2,
                ease: "expo.out",
                clearProps: "all"
            });
        }
    }, { scope: containerRef, dependencies: [loading, products.length] });

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1 } });
        tl.from(".page-header-text", { opacity: 0, x: -50, duration: 1.5 })
            .from(".filter-btn-group", { opacity: 0, x: 50 }, "-=1.2");
    }, { scope: containerRef });

    // Animated Empty State GSAP
    useGSAP(() => {
        if (!loading && products.length === 0) {
            const tl = gsap.timeline({ repeat: -1, yoyo: true });
            tl.to(".empty-icon", { y: -20, rotate: 5, duration: 2, ease: "power1.inOut" })
                .to(".empty-glow", { opacity: 0.4, scale: 1.2, duration: 2, ease: "power1.inOut" }, "-=2");
        }
    }, { scope: emptyStateRef, dependencies: [loading, products.length] });

    useEffect(() => {
        categoryService.getAll().then((r) => setCategories(r.data || [])).catch(() => { });
    }, []);

    const getFiltersFromURL = useCallback(() => ({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        min_price: searchParams.get("min_price") || "",
        max_price: searchParams.get("max_price") || "",
        sort: searchParams.get("sort") || "created_at",
        order: searchParams.get("order") || "desc",
        page: parseInt(searchParams.get("page")) || 1,
    }), [searchParams]);

    useEffect(() => {
        const filters = getFiltersFromURL();
        setLoading(true);
        const params = {};
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
        productService.getAll(params)
            .then((res) => {
                setProducts(res.data.products || []);
                setPagination(res.data.pagination || {});
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [searchParams.toString(), getFiltersFromURL]);

    const currentFilters = getFiltersFromURL();

    const updateFilter = (key, value) => {
        const next = { ...currentFilters, [key]: value, page: 1 };
        const p = {};
        Object.entries(next).forEach(([k, v]) => { if (v) p[k] = v; });
        setSearchParams(p);
    };

    const clearFilters = () => setSearchParams({});

    const hasActiveFilters = !!(currentFilters.search || currentFilters.category || currentFilters.min_price || currentFilters.max_price);

    const activeCategory = categories.find(
        (c) => c.id === currentFilters.category || c.slug === currentFilters.category
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#050505] pb-40 relative">
            {/* Cinematic Background Depth */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--accent)] rounded-full blur-[300px] opacity-[0.02]" />
            </div>

            <div className="container relative z-10">
                {/* Header Section */}
                <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-12 pt-20">
                    <div className="max-w-3xl">
                        <div className="inline-block px-4 py-1.5 glass-morphism rounded-full border-white/5 mb-8">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">The Digital Index // v.1.0</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic leading-[0.85] tracking-tighter text-white">
                            {currentFilters.search ? (
                                <>QUERIES_<span className="text-[var(--accent)]">"{currentFilters.search}"</span></>
                            ) : activeCategory ? (
                                <>ARCHIVE_<span className="text-[var(--accent)]">{activeCategory.name}</span></>
                            ) : (
                                <>MARKETPLACE <br /> <span className="text-white/10">ARCHIVE.</span></>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-4 px-8 py-4 glass-morphism rounded-full border-white/5 transition-all group ${showFilters ? 'bg-white text-black' : 'text-white/40'}`}
                        >
                            <SlidersHorizontal size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Filters</span>
                        </button>

                        <div className="relative group/sort">
                            <button className="flex items-center gap-4 px-8 py-4 glass-morphism rounded-full border-white/5 text-white/40 hover:text-white transition-all">
                                <ChevronDown size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em]">{currentFilters.sort.replace('_', ' ')}</span>
                            </button>
                            <div className="absolute top-full right-0 mt-4 w-56 crystal-pane rounded-3xl border-white/5 opacity-0 translate-y-4 pointer-events-none group-hover/sort:opacity-100 group-hover/sort:translate-y-0 group-hover/sort:pointer-events-auto transition-all duration-500 z-50 overflow-hidden shadow-luxury">
                                {["created_at_desc", "price_asc", "price_desc", "name_asc"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            const [sortKey, sortOrder] = s.split('_');
                                            updateFilter("sort", sortKey);
                                            updateFilter("order", sortOrder || "desc");
                                        }}
                                        className="w-full px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white hover:text-black transition-colors border-b border-white/5 last:border-0"
                                    >
                                        {s.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tape */}
                <div className="mb-20 flex overflow-x-auto no-scrollbar gap-8 pb-4 border-b border-white/5">
                    <button
                        onClick={() => updateFilter("category", "")}
                        className={`text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all ${!currentFilters.category ? 'text-[var(--accent)]' : 'text-white/20 hover:text-white/40'}`}
                    >
                        [ ALL_INDEX ]
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilter("category", cat.slug || cat.id)}
                            className={`text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all ${currentFilters.category === (cat.slug || cat.id) ? 'text-[var(--accent)]' : 'text-white/20 hover:text-white/40'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid - Standard 4-column to reduce congestion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {loading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-6">
                                <div className="aspect-[3/4.5] rounded-3xl bg-white/5" />
                                <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        products.map((p) => (
                            <div key={p.id} className="product-reveal">
                                <ProductCard product={p} />
                            </div>
                        ))
                    ) : (
                        <div ref={emptyStateRef} className="col-span-full py-40 flex flex-col items-center justify-center text-center crystal-pane rounded-[64px] border border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[var(--accent)]/5 blur-[100px] opacity-20 empty-glow" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 empty-icon">
                                    <Search size={32} className="text-[var(--accent)]" />
                                </div>
                                <h3 className="text-4xl font-black italic mb-4 text-white uppercase tracking-tighter">Archive_Empty.</h3>
                                <p className="text-white/30 max-w-sm mx-auto mb-10 text-sm font-medium">No results found for current index parameters.</p>
                                <button onClick={clearFilters} className="btn-primary !px-12 !py-5 !rounded-full !text-[10px] !font-black !tracking-[0.4em] !uppercase shadow-luxury border-none">Reset_Archive</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-40 flex justify-center items-center gap-8">
                        <div className="h-px w-12 bg-white/10" />
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => updateFilter("page", i + 1)}
                                className={`text-[10px] font-black tracking-[0.4em] transition-all ${currentFilters.page === i + 1 ? 'text-[var(--accent)] scale-125' : 'text-white/20 hover:text-white/40'}`}
                            >
                                {i + 1 < 10 ? `0${i + 1}` : i + 1}
                            </button>
                        ))}
                        <div className="h-px w-12 bg-white/10" />
                    </div>
                )}
            </div>

            {/* Micro-Grain Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] bg-noise opacity-[0.03] mix-blend-overlay"></div>
        </div>
    );
}
