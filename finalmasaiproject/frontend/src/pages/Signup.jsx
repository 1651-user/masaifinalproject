import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Signup() {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", store_name: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
        tl.from(".signup-side-img", { scale: 1.1, opacity: 0, duration: 1.5, clearProps: "all" })
            .from(".signup-card", { y: 30, opacity: 0, duration: 1, clearProps: "all" }, "-=1")
            .from(".signup-stagger", { y: 20, opacity: 0, stagger: 0.08, clearProps: "all" }, "-=0.8");
    }, { scope: containerRef });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await register(form);
            toast.success("Welcome to ShopLocal!");
            navigate(form.role === "vendor" ? "/vendor/dashboard" : "/");
        } catch (err) { toast.error(err.response?.data?.error || "Registration failed"); }
        finally { setLoading(false); }
    };

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div ref={containerRef} className="min-h-screen flex" style={{ background: "var(--bg)" }}>
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#ffbed6] items-center justify-center flex-col">
                <img src="/sale_bubble.png" alt="Sale" className="w-[85%] max-w-lg h-auto object-contain signup-side-img relative z-10 -mt-20" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-12 z-20 pb-20 text-center">
                    <p className="text-[#a81446] text-4xl font-black mb-3 font-['Playfair_Display']">Join the community.</p>
                    <p className="text-[#a81446]/80 text-lg font-medium">Start selling unique items or shopping local today.</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 lg:p-24 overflow-y-auto max-h-screen">
                <div className="w-full max-w-md mx-auto signup-card">
                    <div className="flex items-center gap-2 mb-10 signup-stagger">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect width="24" height="24" rx="4" fill="var(--accent)" /><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="serif">SL</text></svg>
                        <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)" }}>ShopLocal</span>
                    </div>

                    <h1 className="text-4xl font-black mb-3 signup-stagger font-['Playfair_Display'] tracking-tight" style={{ color: "var(--text)" }}>Create account</h1>
                    <p className="text-base mb-10 font-medium signup-stagger" style={{ color: "var(--text-secondary)" }}>Already a member? <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Sign in</Link></p>

                    <div className="flex p-1.5 rounded-full mb-8 signup-stagger shadow-inner" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)" }}>
                        {[{ v: "customer", l: "I want to shop" }, { v: "vendor", l: "I want to sell" }].map((o) => (
                            <button key={o.v} type="button" onClick={() => setForm({ ...form, role: o.v })}
                                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all"
                                style={form.role === o.v ? { background: "var(--accent)", color: "white" } : { color: "var(--text-secondary)" }}>
                                {o.l}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="signup-stagger">
                            <label className="block text-sm font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: "var(--text-muted)" }}>Full name</label>
                            <input type="text" value={form.name} onChange={update("name")} required className="input" placeholder="Jane Doe" />
                        </div>

                        {form.role === "vendor" && (
                            <div className="signup-stagger">
                                <label className="block text-sm font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: "var(--text-muted)" }}>Shop name</label>
                                <input type="text" value={form.store_name} onChange={update("store_name")} required className="input" placeholder="Jane's Handmade Co." />
                            </div>
                        )}

                        <div className="signup-stagger">
                            <label className="block text-sm font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: "var(--text-muted)" }}>Email address</label>
                            <input type="email" value={form.email} onChange={update("email")} required className="input" placeholder="you@example.com" />
                        </div>

                        <div className="signup-stagger">
                            <label className="block text-sm font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: "var(--text-muted)" }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={form.password} onChange={update("password")} required className="input !pr-11" placeholder="Minimum 6 characters" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div className="signup-stagger pt-4">
                            <button type="submit" disabled={loading} className="btn-primary w-full !text-base !py-4 !rounded-full">
                                {loading ? "Creating account…" : form.role === "vendor" ? "Open your shop" : "Create account"}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                        By registering, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer hover:text-[var(--text)] transition-colors">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
