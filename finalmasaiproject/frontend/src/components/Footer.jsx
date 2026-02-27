import { Link } from "react-router-dom";

const W = { width: "100%", paddingLeft: "clamp(16px, 5vw, 64px)", paddingRight: "clamp(16px, 5vw, 64px)" };

const LINKS = {
    Shop: [["Gift cards", "/products"], ["ShopLocal Registry", "/products"], ["Sitemap", "/products"], ["ShopLocal blog", "/products"]],
    Sell: [["Sell on ShopLocal", "/signup"], ["Teams", "/signup"], ["Forums", "/signup"], ["Affiliates", "/signup"]],
    About: [["ShopLocal, Inc.", "/products"], ["Policies", "/products"], ["Investors", "/products"], ["Careers", "/products"]],
    Help: [["Help Centre", "/products"], ["Privacy settings", "/products"], ["Download the App", "/products"]],
};

export default function Footer() {
    return (
        <footer style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-light)", width: "100%" }}>
            <div style={{ ...W, paddingTop: 52, paddingBottom: 28 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "32px 24px", marginBottom: 44 }}>
                    {Object.entries(LINKS).map(([heading, links]) => (
                        <div key={heading}>
                            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                                {heading}
                            </p>
                            {links.map(([label, href]) => (
                                <Link key={label} to={href}
                                    style={{ display: "block", fontSize: 14, color: "var(--text-secondary)", marginBottom: 11, lineHeight: 1.5, textDecoration: "none" }}
                                    className="hover:underline">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                            <rect width="24" height="24" rx="4" fill="var(--accent)" />
                            <text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="serif">SL</text>
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>ShopLocal</span>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>© 2026 ShopLocal, Inc.</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
                        {["Terms of Use", "Privacy", "Interest-based ads", "Local Shops"].map((lbl) => (
                            <Link key={lbl} to="/products"
                                style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}
                                className="hover:underline">
                                {lbl}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
