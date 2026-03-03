import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, ChevronDown, LogOut, Store, Shield, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { name: "Clothing", slug: "clothing" },
  { name: "Jewelry", slug: "jewelry" },
  { name: "Home & Garden", slug: "home-garden" },
  { name: "Electronics", slug: "electronics" },
  { name: "Books", slug: "books" },
  { name: "Beauty", slug: "beauty" },
  { name: "Sports", slug: "sports" },
  { name: "Handmade", slug: "handmade" },
];

// No custom W variables, using Tailwind classes for containers

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { dark, toggle: toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const items = itemCount ? Array(itemCount).fill({}) : []; // Mock for UI count

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-1000">
      <div className={`mx-auto transition-all duration-1000 ${scrolled ? 'max-w-[1400px] mt-4 px-6' : 'max-w-full mt-0 px-10'}`}>
        <nav className={`relative flex items-center justify-between transition-all duration-1000 ${scrolled ? 'bg-black/[0.05] backdrop-blur-xl rounded-full px-12 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-black/10' : 'bg-transparent px-0 py-8 border-b border-black/5'}`}>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-4 group no-underline nav-logo">
            <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <span className="text-4xl bubble-text tracking-tighter group-hover:tracking-normal transition-all duration-700 pb-1">
              Shop Local.
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 nav-categories">
            <Link to="/products" className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all no-underline">Marketplace</Link>
            <div className="w-1 h-1 rounded-full bg-[var(--accent)]/30"></div>
            <Link to="/categories" className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all no-underline">Categories</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-8 nav-actions">
            <form onSubmit={handleSearch} className="hidden md:block nav-search">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="SEARCH"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40 focus:w-64 px-8 py-3 bg-white/50 border border-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text)] focus:bg-white transition-all outline-none placeholder:text-[var(--text-muted)] shadow-inner"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent)] group-focus-within:scale-110 transition-transform" size={14} />
              </div>
            </form>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative group/profile">
                  <button className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full glass-morphism border-white/10 flex items-center justify-center text-[10px] font-black text-[var(--accent)] group-hover:scale-110 transition-all">
                      {user.username?.[0]?.toUpperCase() || user.role?.[0]?.toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute top-full right-0 pt-2 w-72 opacity-0 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:pointer-events-auto transition-all duration-500 z-[1000]">
                    <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border-2 border-white/60 shadow-xl overflow-hidden translate-y-4 group-hover/profile:translate-y-0 transition-transform duration-500">
                      <div className="px-8 py-6 bg-[var(--accent)]/10 border-b border-white/40">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-2">Authenticated_User</p>
                        <p className="text-sm font-black text-[var(--text)] truncate">{user.username || user.email}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-hover)] mt-1">{user.role}</p>
                      </div>
                      <div className="p-5 grid gap-2">
                        {user.role === 'customer' && (
                          <>
                            <Link to="/dashboard" className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group/item no-underline">
                              <User size={14} className="text-[var(--text-muted)] group-hover/item:text-[var(--accent)]" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover/item:text-[var(--accent)]">My Account</span>
                            </Link>
                            <Link to="/wishlist" className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group/item no-underline">
                              <Heart size={14} className="text-[var(--text-muted)] group-hover/item:text-[var(--accent)]" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover/item:text-[var(--accent)]">Wishlist</span>
                            </Link>
                          </>
                        )}
                        {user.role === 'vendor' && (
                          <Link to="/vendor/dashboard" className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group/item no-underline">
                            <Store size={14} className="text-[var(--text-muted)] group-hover/item:text-[var(--accent)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover/item:text-[var(--accent)]">Vendor Portal</span>
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link to="/admin/dashboard" className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group/item no-underline">
                            <Shield size={14} className="text-[var(--text-muted)] group-hover/item:text-[var(--accent)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover/item:text-[var(--accent)]">Admin Panel</span>
                          </Link>
                        )}
                        <div className="h-px bg-white/40 my-2" />
                        <button onClick={logout} className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all group/item text-left w-full border-none bg-transparent">
                          <LogOut size={14} className="text-[var(--text-muted)] group-hover/item:text-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover/item:text-white">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all no-underline">Sign_In</Link>
                  <Link to="/signup" className="px-8 py-3 bg-[var(--accent)] !text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[var(--accent-hover)] transition-all no-underline ring-0 shadow-[0_4px_15px_rgba(255,77,109,0.3)] hover:scale-105">Join_Now</Link>
                </div>
              )}

              {user?.role === 'customer' && (
                <Link to="/cart" className="relative w-12 h-12 bg-black/[0.05] backdrop-blur-md rounded-full flex items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all border border-black/10 no-underline shadow-sm hover:scale-110">
                  <ShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse shadow-luxury">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-12 h-12 bg-black/[0.05] backdrop-blur-md border border-black/10 rounded-full flex items-center justify-center text-[var(--text)] shadow-sm">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[900] bg-[var(--bg)] transition-all duration-1000 ${mobileOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-full'}`}>
        <div className="h-full flex flex-col justify-center px-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] bg-[var(--accent)] rounded-full blur-[100px] opacity-20 pointer-events-none mix-blend-screen" />
          <div className="space-y-10 relative z-10">
            <Link to="/products" className="block text-6xl md:text-8xl bubble-text no-underline hover:scale-105 origin-left transition-transform" onClick={() => setMobileOpen(false)}>Marketplace</Link>
            <Link to="/categories" className="block text-6xl md:text-8xl bubble-text !text-[var(--text-muted)] opacity-60 hover:scale-105 origin-left transition-transform no-underline" onClick={() => setMobileOpen(false)}>Categories</Link>
            <div className="h-2 bg-white/40 my-8 rounded-full w-24"></div>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.slice(0, 4).map(c => (
                <Link key={c.slug} to={`/products?category=${c.slug}`} className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--accent)] no-underline" onClick={() => setMobileOpen(false)}>{c.name}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
