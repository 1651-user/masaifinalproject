import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, ChevronDown, LogOut, Store, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";

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

const W = { width: "100%", paddingLeft: "clamp(16px, 5vw, 64px)", paddingRight: "clamp(16px, 5vw, 64px)" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { dark, toggle: toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header
      style={{ backgroundColor: "var(--bg)", borderBottom: "1px solid var(--border-light)", width: "100%" }}
      className="sticky top-0 z-50"
    >
      <div style={{ ...W, display: "flex", alignItems: "center", gap: 16, paddingTop: 12, paddingBottom: 12 }}>

        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
            <rect width="32" height="32" rx="6" fill="var(--accent)" />
            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" fontFamily="serif">SL</text>
          </svg>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.5px" }}
            className="hidden sm:block">
            ShopLocal
          </span>
        </Link>

        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", borderRadius: 99, border: "2px solid var(--text)", overflow: "hidden", width: "100%"
          }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything"
              style={{
                flex: 1, minWidth: 0, padding: "11px 20px", fontSize: 15,
                background: "var(--bg)", color: "var(--text)", outline: "none", border: "none"
              }}
            />
            <button type="submit" style={{
              background: "var(--text)", padding: "11px 22px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Search size={18} color="var(--bg)" />
            </button>
          </div>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <button onClick={toggleTheme}
            style={{ padding: 8, borderRadius: "50%", color: "var(--text-secondary)", display: "flex" }}
            className="hover:bg-[var(--bg-secondary)] transition">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && user.role === "customer" && (
            <Link to="/wishlist"
              style={{ padding: 8, borderRadius: "50%", color: "var(--text-secondary)", display: "none", position: "relative" }}
              className="sm:flex hover:bg-[var(--bg-secondary)] transition items-center">
              <Heart size={20} />
              {wishlistItems?.length > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2, minWidth: 18, height: 18,
                  background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 700,
                  borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px"
                }}>{wishlistItems.length}</span>
              )}
            </Link>
          )}

          <Link to="/cart"
            style={{ padding: 8, borderRadius: "50%", color: "var(--text-secondary)", position: "relative", display: "flex" }}
            className="hover:bg-[var(--bg-secondary)] transition items-center">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2, minWidth: 18, height: 18,
                background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 700,
                borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px"
              }}>{itemCount}</span>
            )}
          </Link>

          {user ? (
            <div style={{ position: "relative", marginLeft: 4 }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 8px",
                  borderRadius: 99, border: "1.5px solid var(--border)", background: "var(--bg)",
                  cursor: "pointer", color: "var(--text)"
                }}
                className="hover:shadow-md transition-shadow">
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: "var(--accent)",
                  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }} className="hidden lg:block">
                  {user.name?.split(" ")[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220,
                    background: "var(--bg-card)", border: "1px solid var(--border-light)",
                    borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                    zIndex: 50, padding: "8px 0"
                  }} className="animate-fade">
                    <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--border-light)" }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, textTransform: "capitalize" }}>
                        {user.role} account
                      </p>
                    </div>
                    {[
                      { to: user.role === "vendor" ? "/vendor/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/dashboard", icon: user.role === "vendor" ? Store : user.role === "admin" ? Shield : User, label: user.role === "vendor" ? "Vendor Dashboard" : user.role === "admin" ? "Admin Panel" : "My Account" },
                      ...(user.role === "customer" ? [{ to: "/wishlist", icon: Heart, label: "My Favourites" }] : []),
                      ...(user.role === "admin" ? [{ to: "/vendor/dashboard", icon: Store, label: "Vendor View" }] : []),
                    ].map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", fontSize: 14, color: "var(--text)", textDecoration: "none" }}
                        className="hover:bg-[var(--bg-secondary)] transition">
                        <item.icon size={15} /> {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid var(--border-light)", margin: "4px 0" }} />
                    <button onClick={() => { logout(); setUserMenuOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", fontSize: 14, color: "var(--danger)", width: "100%", cursor: "pointer" }}
                      className="hover:bg-[var(--bg-secondary)] transition">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
              <Link to="/login"
                style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textDecoration: "none" }}
                className="hover:underline">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary" style={{ fontSize: 14, padding: "9px 20px" }}>
                Register
              </Link>
            </div>
          )}

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 8, borderRadius: 8, color: "var(--text)", display: "flex" }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className="hidden md:block" style={{ borderTop: "1px solid var(--border-light)" }}>
        <div style={{ ...W, paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0", overflowX: "auto" }}
            className="no-scrollbar">
            <Link to="/products"
              style={{ padding: "7px 16px", fontSize: 13, fontWeight: 700, color: "var(--text)", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}
              className="hover:bg-[var(--bg-secondary)] transition">
              All Categories
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                style={{ padding: "7px 16px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}
                className="hover:bg-[var(--bg-secondary)] transition">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden" style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg)", ...W, paddingTop: 16, paddingBottom: 16 }}>
          {!user ? (
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 14, padding: "10px" }}>Sign in</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 14, padding: "10px" }}>Register</Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: 12, borderRadius: 16, background: "var(--bg-secondary)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                {user.name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{user.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>{user.role}</p>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.slug} to={`/products?category=${c.slug}`} onClick={() => setMobileOpen(false)}
                style={{ textAlign: "center", padding: "10px 4px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "var(--bg-secondary)", color: "var(--text)", textDecoration: "none" }}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
