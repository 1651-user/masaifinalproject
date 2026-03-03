import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Grid, Tag } from "lucide-react";
import { categoryService } from "../services";

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
    "art": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop",
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

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        categoryService.getAll()
            .then((res) => setCategories(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            {/* Page Header */}
            <div className="border-b border-white/5 bg-white/[0.02]">
                <div className="container py-12">
                    <div className="flex items-center gap-2 text-white/30 text-sm mb-4">
                        <Link to="/" className="hover:text-white transition-colors no-underline">Home</Link>
                        <span>/</span>
                        <span className="text-white">Categories</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">All Categories</h1>
                            <p className="text-white/40">
                                Browse products by category — {loading ? "..." : `${categories.length} categories`} available
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-full hover:bg-[var(--accent-hover)] transition-all no-underline self-start md:self-auto"
                        >
                            All Products <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container py-12">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/3] bg-white/5 rounded-2xl mb-4" />
                                <div className="h-5 bg-white/5 rounded-full w-2/3 mb-2" />
                                <div className="h-4 bg-white/5 rounded-full w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-32 text-center">
                        <Grid size={48} className="text-white/10 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white/40 mb-2">No Categories Yet</h2>
                        <p className="text-white/20 mb-6">Categories will appear here once vendors add products.</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-full hover:bg-[var(--accent-hover)] transition-all no-underline"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?category=${cat.slug || cat.name?.toLowerCase()}`}
                                className="group block no-underline"
                            >
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                                    <img
                                        src={cat.image_url || getCategoryImage(cat.name)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getCategoryImage(cat.name);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="text-xl font-black text-white">{cat.name}</h3>
                                        {cat.product_count != null && (
                                            <p className="text-sm text-white/70">{cat.product_count} products</p>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-[var(--accent)]">
                                        <ArrowRight size={14} className="text-white" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
