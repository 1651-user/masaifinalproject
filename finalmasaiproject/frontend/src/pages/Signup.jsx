import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Signup() {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", store_name: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

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
        <div className="min-h-screen flex items-start justify-center px-4 sm:px-8 py-8 sm:py-16" style={{ background: "var(--bg-secondary)" }}>
            <div className="w-full sm:max-w-lg animate-up">
                <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                    <div className="flex items-center gap-2 mb-6">
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none"><rect width="24" height="24" rx="4" fill="var(--accent)" /><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="serif">SL</text></svg>
                        <span className="font-bold" style={{ color: "var(--accent)" }}>ShopLocal</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Create your account</h1>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Already a member? <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Sign in</Link></p>

                    <div className="flex p-1 rounded-full mb-5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)" }}>
                        {[{ v: "customer", l: "I want to shop" }, { v: "vendor", l: "I want to sell" }].map((o) => (
                            <button key={o.v} type="button" onClick={() => setForm({ ...form, role: o.v })}
                                className="flex-1 py-2 rounded-full text-sm font-semibold transition-all"
                                style={form.role === o.v ? { background: "var(--accent)", color: "white" } : { color: "var(--text-secondary)" }}>
                                {o.l}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Full name</label>
                            <input type="text" value={form.name} onChange={update("name")} required className="input" placeholder="Jane Doe" />
                        </div>

                        {form.role === "vendor" && (
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Shop name</label>
                                <input type="text" value={form.store_name} onChange={update("store_name")} required className="input" placeholder="Jane's Handmade Co." />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Email address</label>
                            <input type="email" value={form.email} onChange={update("email")} required className="input" placeholder="you@example.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={form.password} onChange={update("password")} required className="input !pr-11" placeholder="Minimum 6 characters" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full !text-base !py-3 !rounded-full">
                            {loading ? "Creating account…" : form.role === "vendor" ? "Open your shop" : "Create account"}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                        By registering, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
