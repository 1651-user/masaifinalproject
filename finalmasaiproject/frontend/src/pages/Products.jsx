import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

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
    }, [searchParams.toString()]); // re-run whenever URL changes

    const filters = getFiltersFromURL();

    const updateFilter = (key, value) => {
        const next = { ...filters, [key]: value, page: 1 };
        const p = {};
        Object.entries(next).forEach(([k, v]) => { if (v) p[k] = v; });
        setSearchParams(p);
    };

    const clearFilters = () => setSearchParams({});

    const hasActiveFilters = filters.search || filters.category || filters.min_price || filters.max_price;

    const activeCategory = categories.find(
        (c) => c.id === filters.category || c.slug === filters.category
    );

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div style={{ background: "var(--bg)" }} className="min-h-screen">
            <div className="border-b" style={{ borderColor: "var(--border-light)", background: "var(--bg)" }}>
                <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                            {filters.search
                                ? `Results for "${filters.search}"`
                                : activeCategory
                                    ? activeCategory.name
                                    : "All Products"}
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {pagination.total || 0} results
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={`${filters.sort}_${filters.order}`}
                                onChange={(e) => {
                                    const [s, o] = e.target.value.split("_");
                                    const next = { ...filters, sort: s, order: o, page: 1 };
                                    const p = {};
                                    Object.entries(next).forEach(([k, v]) => { if (v) p[k] = v; });
                                    setSearchParams(p);
                                }}
                                className="appearance-none pl-3 pr-8 py-2 rounded-full border text-sm font-medium cursor-pointer"
                                style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                                <option value="created_at_desc">Sort: Newest</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Name: A–Z</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                        </div>

                        <button onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition"
                            style={{ borderColor: showFilters ? "var(--accent)" : "var(--border)", color: showFilters ? "var(--accent)" : "var(--text)", background: "var(--bg)" }}>
                            <SlidersHorizontal size={14} /> Filters {hasActiveFilters && <span className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--accent)" }}>!</span>}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="border-t" style={{ borderColor: "var(--border-light)", background: "var(--bg-secondary)" }}>
                        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[160px]">
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Search</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                                    <input type="text" defaultValue={filters.search}
                                        onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", e.target.value); }}
                                        onBlur={(e) => updateFilter("search", e.target.value)}
                                        placeholder="Search listings..."
                                        className="input !pl-9 !rounded-full !py-2" />
                                </div>
                            </div>

                            <div className="min-w-[160px]">
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Category</label>
                                <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} className="input !rounded-full !py-2">
                                    <option value="">All categories</option>
                                    {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="min-w-[200px]">
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Price range (₹)</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" defaultValue={filters.min_price}
                                        onBlur={(e) => updateFilter("min_price", e.target.value)}
                                        placeholder="Min" className="input !rounded-full !py-2 w-24" />
                                    <span style={{ color: "var(--text-muted)" }}>—</span>
                                    <input type="number" defaultValue={filters.max_price}
                                        onBlur={(e) => updateFilter("max_price", e.target.value)}
                                        placeholder="Max" className="input !rounded-full !py-2 w-24" />
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-semibold self-end pb-2 hover:underline" style={{ color: "var(--accent)" }}>
                                    <X size={14} /> Clear all
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-7">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square rounded-xl mb-2.5" style={{ background: "var(--border)" }} />
                                <div className="h-3 rounded mb-1.5" style={{ background: "var(--border)", width: "75%" }} />
                                <div className="h-3 rounded" style={{ background: "var(--border)", width: "45%" }} />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>No listings found</p>
                        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Try adjusting or clearing your filters</p>
                        <button onClick={clearFilters} className="btn-primary">Clear all filters</button>
                    </div>
                )}

                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button key={i} onClick={() => updateFilter("page", i + 1)}
                                className="w-9 h-9 rounded-full text-sm font-bold transition-all"
                                style={filters.page === i + 1
                                    ? { background: "var(--text)", color: "var(--bg)" }
                                    : { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
